import { mean as d3Mean } from 'd3-array';
import { format as d3Format } from 'd3-format';
import { timeFormat as d3TimeFormat } from 'd3-time-format';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
import {
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { ChartWrapper, TooltipWrapper } from './AdvancedAnalyticsChart.styles';

type ValueType = string | number | (string | number)[];
type NameType = string | number;

interface CustomTooltipProps
  extends Omit<TooltipProps<ValueType, NameType>, 'payload' | 'label'> {
  active?: boolean;
  payload?: {
    name: NameType;
    value: ValueType;
    color?: string;
  }[];
  label?: string | number;
  dateFormat?: string;
  valueFormat?: string;
  formatType?: 'time' | 'category';
}

/**
 * Defines the properties for the AdvancedAnalyticsChart component.
 * @template TData The shape of the data object.
 */
interface AdvancedAnalyticsChartProps<TData extends object> {
  /**
   * The array of data objects to plot.
   */
  data: TData[];
  /**
   * The key in TData to use for the X-axis (categories or dates).
   */
  xAxisKey: keyof TData;
  /**
   * The key in TData to use for the Bar chart data.
   */
  barDataKey: keyof TData;
  /**
   * The key in TData to use for the Line chart data.
   */
  lineDataKey: keyof TData;
  /**
   * A human-readable label for the Bar chart data (e.g., "Units Sold").
   */
  barName: string;
  /**
   * A human-readable label for the Line chart data (e.g., "Revenue").
   */
  lineName: string;
  /**
   * Descriptive label for the left Y-axis.
   */
  yAxisLeftLabel: string;
  /**
   * Descriptive label for the right Y-axis.
   */
  yAxisRightLabel: string;
  /**
   * If true, enables a data brush slider at the bottom to navigate
   * large datasets while keeping Y-axes static.
   */
  enableDataBrush?: boolean;
  /**
   * Specifies if the X-axis data is time-based or categorical.
   */
  xAxisFormatType?: 'time' | 'category';
  /**
   * A d3-format string for the left Y-axis ticks (e.g., "$,.0s").
   */
  yAxisLeftFormat?: string;
  /**
   * A d3-format string for the right Y-axis ticks (e.g., ".2s").
   */
  yAxisRightFormat?: string;
  /**
   * A d3-time-format string for the tooltip label (e.g., "%B %d, %Y").
   * Only used if xAxisFormatType is 'time'.
   */
  tooltipDateFormat?: string;
  /**
   * A d3-format string for the tooltip value (e.g., "$,.2f").
   */
  tooltipValueFormat?: string;
  /**
   * A d3-format string for the X-axis tick (e.g., "%b %y").
   * Only used if xAxisFormatType is 'time'.
   */
  xAxisTickFormat?: string;
}

/**
 * A custom tooltip component for the chart, formatted with d3.
 * @param {TooltipProps<ValueType, NameType>} props The props injected by Recharts.
 * @param {string} [dateFormat] Optional d3-time-format string for the label.
 * @param {string} [valueFormat] Optional d3-format string for the values.
 * @param {'time' | 'category'} [formatType] The type of the x-axis.
 * @returns {React.ReactElement | null} The custom tooltip element.
 */
const CustomTooltip: FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  dateFormat,
  valueFormat,
  formatType,
}): React.ReactElement | null => {
  if (!active || !payload || !payload.length || typeof label === 'undefined') {
    return null;
  }

  const valueFormatter = d3Format(valueFormat || ',');

  let formattedLabel: string;
  if (formatType === 'time') {
    const dateFormatter = d3TimeFormat(dateFormat || '%Y-%m-%d');
    formattedLabel = dateFormatter(new Date(label));
  } else {
    formattedLabel = label.toString();
  }

  return (
    <TooltipWrapper>
      <p className="tooltip-label">{formattedLabel}</p>
      {payload.map((entry) => {
        const value = entry.value;
        let displayValue: string;

        if (typeof value === 'number') {
          displayValue = valueFormatter(value);
        } else if (typeof value === 'string') {
          const parsedValue = parseFloat(value);
          displayValue = !isNaN(parsedValue)
            ? valueFormatter(parsedValue)
            : value;
        } else if (Array.isArray(value)) {
          displayValue = value
            .map((v) => (typeof v === 'number' ? valueFormatter(v) : v))
            .join(', ');
        } else {
          displayValue = 'N/A';
        }

        return (
          <div key={entry.name} className="tooltip-item">
            <span
              className="tooltip-color-swatch"
              style={{ backgroundColor: entry.color || 'var(--text-primary)' }}
            />
            <span className="tooltip-item-name">{entry.name}:</span>
            <span className="tooltip-item-value">{displayValue}</span>
          </div>
        );
      })}
    </TooltipWrapper>
  );
};

/**
 * Represents the dimensions of an element.
 */
interface Dimensions {
  width: number;
  height: number;
}

/**
 * A custom hook that observes the dimensions of a referenced element using ResizeObserver.
 * @param {React.RefObject<T | null>} ref The ref to the element to observe.
 * @returns {Dimensions} The width and height of the observed element.
 */
const useResizeObserver = <T extends HTMLElement>(
  ref: React.RefObject<T | null>
): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const element = ref?.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return dimensions;
};

const MOBILE_BREAKPOINT = 480;

/**
 * The default number of data points to show in the mobile view
 * when the data brush is enabled.
 */
const MOBILE_DATA_WINDOW_SIZE = 30;

/**
 * Represents the state of the Recharts Brush component.
 */
interface BrushRange {
  startIndex?: number;
  endIndex?: number;
}

/**
 * An advanced analytics chart that combines a Bar and a Line chart with dual Y-axes,
 * leveraging d3 for robust data formatting and calculations.
 *
 * @template TData The shape of the data object being plotted.
 * @param {AdvancedAnalyticsChartProps<TData>} props The component props.
 * @returns {React.ReactElement} A responsive composed chart.
 */
const AdvancedAnalyticsChart = <TData extends object>({
  data,
  xAxisKey,
  barDataKey,
  lineDataKey,
  barName,
  lineName,
  yAxisLeftLabel,
  yAxisRightLabel,
  enableDataBrush,
  xAxisFormatType = 'category',
  yAxisLeftFormat = '~s',
  yAxisRightFormat = '~s',
  tooltipDateFormat = '%B %d, %Y',
  tooltipValueFormat = ',.2f',
  xAxisTickFormat = '%b %d',
}: AdvancedAnalyticsChartProps<TData>): React.ReactElement => {
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const { width } = useResizeObserver(chartWrapperRef);
  const isMobile = width > 0 && width < MOBILE_BREAKPOINT;

  const mobileStartIndex = Math.max(0, data.length - MOBILE_DATA_WINDOW_SIZE);
  const mobileEndIndex = data.length - 1;

  const [brushRange, setBrushRange] = useState<BrushRange>({
    startIndex: isMobile ? mobileStartIndex : undefined,
    endIndex: isMobile ? mobileEndIndex : undefined,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBrushRange({
      startIndex: isMobile ? mobileStartIndex : undefined,
      endIndex: isMobile ? mobileEndIndex : undefined,
    });
  }, [isMobile, mobileStartIndex, mobileEndIndex]);

  const handleBrushChange = (newRange: BrushRange) => {
    setBrushRange({
      startIndex: newRange.startIndex,
      endIndex: newRange.endIndex,
    });
  };

  const averageLineValue = useMemo(() => {
    const values = data.map((d) => d[lineDataKey] as number | undefined);
    const validValues = values.filter(
      (v): v is number => typeof v === 'number' && isFinite(v)
    );
    return d3Mean(validValues);
  }, [data, lineDataKey]);

  const yLeftTickFormatter = useCallback(
    (value: number) => d3Format(yAxisLeftFormat)(value),
    [yAxisLeftFormat]
  );

  const yRightTickFormatter = useCallback(
    (value: number) => d3Format(yAxisRightFormat)(value),
    [yAxisRightFormat]
  );

  const xTickFormatter = useCallback(
    (value: string | number) => {
      if (xAxisFormatType === 'time') {
        return d3TimeFormat(xAxisTickFormat)(new Date(value));
      }
      return value.toString();
    },
    [xAxisFormatType, xAxisTickFormat]
  );

  const chartMargin = {
    top: 20,
    right: isMobile ? 10 : 30,
    left: isMobile ? 0 : 30,
    bottom: 20,
  };

  const yAxisTickProps = {
    fontSize: isMobile ? '0.65rem' : '0.75rem',
    fill: 'var(--text-secondary)',
  };

  const xAxisTickProps = {
    fontSize: isMobile ? '0.65rem' : '0.75rem',
    fill: 'var(--text-secondary)',
  };

  return (
    <ChartWrapper
      ref={chartWrapperRef}
      role="figure"
      aria-label={`Advanced Analytics Chart showing ${lineName} and ${barName}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={chartMargin}
          aria-label="Composite chart"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xAxisKey as string}
            tickFormatter={xTickFormatter}
            axisLine={false}
            tickLine={false}
            padding={{ left: isMobile ? 5 : 10, right: isMobile ? 5 : 10 }}
            tick={xAxisTickProps}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            tickFormatter={yLeftTickFormatter}
            axisLine={false}
            tickLine={false}
            tick={yAxisTickProps}
            width={isMobile ? 45 : 60}
          >
            <Label
              value={yAxisLeftLabel}
              position="insideLeft"
              angle={-90}
              offset={isMobile ? -15 : -10}
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={yRightTickFormatter}
            axisLine={false}
            tickLine={false}
            tick={yAxisTickProps}
            width={isMobile ? 45 : 60}
          >
            <Label
              value={yAxisRightLabel}
              position="insideRight"
              angle={-90}
              offset={isMobile ? -15 : -10}
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip
            content={
              <CustomTooltip
                dateFormat={tooltipDateFormat}
                valueFormat={tooltipValueFormat}
                formatType={xAxisFormatType}
              />
            }
          />
          <Legend
            verticalAlign={isMobile ? 'bottom' : 'top'}
            align={isMobile ? 'center' : 'right'}
            iconType="circle"
            height={isMobile ? undefined : 40}
            wrapperStyle={isMobile ? { paddingTop: '10px' } : {}}
          />
          <Bar
            dataKey={barDataKey as string}
            name={barName}
            yAxisId="right"
            fill="var(--primary-300)"
            radius={[4, 4, 0, 0]}
            barSize={isMobile ? 12 : 20}
          />
          <Line
            type="monotone"
            dataKey={lineDataKey as string}
            name={lineName}
            yAxisId="left"
            stroke="var(--info-500)"
            strokeWidth={2}
            dot={{
              r: isMobile ? 2 : 4,
              strokeWidth: 2,
              fill: 'var(--info-500)',
            }}
            activeDot={{
              r: isMobile ? 4 : 6,
              fill: 'var(--info-500)',
              stroke: 'var(--bg-surface)',
              strokeWidth: 2,
            }}
          />
          {averageLineValue !== undefined && (
            <ReferenceLine
              y={averageLineValue}
              yAxisId="left"
              stroke="var(--danger-500)"
              strokeDasharray="5 5"
            >
              <Label
                value={`Avg: ${yLeftTickFormatter(averageLineValue)}`}
                position="right"
                fill="var(--danger-500)"
                fontSize={isMobile ? '0.65rem' : '0.75rem'}
                dx={isMobile ? -5 : -10}
                dy={isMobile ? -5 : -10}
                style={{
                  textAnchor: 'end',
                  fontWeight: 700,
                }}
              />
            </ReferenceLine>
          )}
          {enableDataBrush && (
            <Brush
              dataKey={xAxisKey as string}
              startIndex={brushRange.startIndex}
              endIndex={brushRange.endIndex}
              onChange={handleBrushChange}
              height={30}
              stroke="var(--primary-500)"
              fill="var(--bg-surface-elevated)"
              travellerWidth={isMobile ? 20 : 10}
              tickFormatter={isMobile ? () => '' : xTickFormatter}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export { AdvancedAnalyticsChart, type AdvancedAnalyticsChartProps };
