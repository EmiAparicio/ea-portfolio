import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdvancedAnalyticsChart,
  type AdvancedAnalyticsChartProps,
} from './AdvancedAnalyticsChart';
import * as Recharts from 'recharts';

vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal<typeof Recharts>();
  return {
    ...original,
    ResponsiveContainer: vi.fn(({ children }) => (
      <div data-testid="mock-responsive-container">{children}</div>
    )),
    ComposedChart: vi.fn(({ children }) => (
      <div data-testid="mock-composed-chart">{children}</div>
    )),
    Bar: vi.fn(() => <div data-testid="mock-bar" />),
    Line: vi.fn(() => <div data-testid="mock-line" />),
    XAxis: vi.fn(() => <div data-testid="mock-xaxis" />),
    YAxis: vi.fn(() => <div data-testid="mock-yaxis" />),
    Tooltip: vi.fn(() => <div data-testid="mock-tooltip" />),
    Legend: vi.fn(() => <div data-testid="mock-legend" />),
    CartesianGrid: vi.fn(() => <div data-testid="mock-grid" />),
    ReferenceLine: vi.fn(({ children }) => (
      <div data-testid="mock-ref-line">{children}</div>
    )),
    Brush: vi.fn(() => <div data-testid="mock-brush" />),
    Label: vi.fn(() => <div data-testid="mock-label" />),
  };
});

const mockTimeData = [
  { date: '2023-01-01T00:00:00Z', revenue: 100000, units: 500 },
  { date: '2023-01-02T00:00:00Z', revenue: 115000, units: 480 },
  { date: '2023-01-03T00:00:00Z', revenue: 135000, units: 520 },
  { date: '2023-01-04T00:00:00Z', revenue: 250000, units: 530 },
];

const defaultProps: AdvancedAnalyticsChartProps<(typeof mockTimeData)[0]> = {
  data: mockTimeData,
  xAxisKey: 'date',
  barDataKey: 'units',
  lineDataKey: 'revenue',
  barName: 'Units Sold',
  lineName: 'Revenue',
  yAxisLeftLabel: 'Revenue (USD)',
  yAxisRightLabel: 'Units',
  enableDataBrush: true,
  xAxisFormatType: 'time',
  yAxisLeftFormat: '$,.0s',
  yAxisRightFormat: '.0s',
  xAxisTickFormat: '%b %d',
};

let resizeObserverCallback: (
  entries: { contentRect: { width: number; height: number } }[]
) => void;

class MockResizeObserver {
  constructor(
    callback: (
      entries: { contentRect: { width: number; height: number } }[]
    ) => void
  ) {
    resizeObserverCallback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

const triggerResize = (width: number) => {
  act(() => {
    if (resizeObserverCallback) {
      resizeObserverCallback([
        {
          contentRect: { width, height: 500 },
        },
      ]);
    }
  });
};

describe('AdvancedAnalyticsChart', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    vi.mocked(Recharts.ComposedChart).mockClear();
    vi.mocked(Recharts.Bar).mockClear();
    vi.mocked(Recharts.Line).mockClear();
    vi.mocked(Recharts.ReferenceLine).mockClear();
    vi.mocked(Recharts.Brush).mockClear();
    vi.mocked(Recharts.XAxis).mockClear();
    vi.mocked(Recharts.YAxis).mockClear();
    vi.mocked(Recharts.Legend).mockClear();
    vi.mocked(Recharts.Label).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render all mocked chart components', () => {
    render(<AdvancedAnalyticsChart {...defaultProps} />);
    triggerResize(1024);

    expect(
      screen.getByRole('figure', {
        name: 'Advanced Analytics Chart showing Revenue and Units Sold',
      })
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-line')).toBeInTheDocument();
    expect(screen.getByTestId('mock-legend')).toBeInTheDocument();
    expect(screen.getByTestId('mock-ref-line')).toBeInTheDocument();
    expect(screen.getByTestId('mock-brush')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-yaxis').length).toBe(2);
  });

  it('should pass correct props to chart components', () => {
    render(<AdvancedAnalyticsChart {...defaultProps} />);
    triggerResize(1024);

    expect(vi.mocked(Recharts.ComposedChart)).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: mockTimeData }),
      undefined
    );
    expect(vi.mocked(Recharts.Bar)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dataKey: 'units',
        name: 'Units Sold',
        yAxisId: 'right',
      }),
      undefined
    );
    expect(vi.mocked(Recharts.Line)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dataKey: 'revenue',
        name: 'Revenue',
        yAxisId: 'left',
      }),
      undefined
    );
    expect(vi.mocked(Recharts.XAxis)).toHaveBeenLastCalledWith(
      expect.objectContaining({ dataKey: 'date' }),
      undefined
    );
    expect(vi.mocked(Recharts.YAxis)).toHaveBeenCalledTimes(6);
    expect(vi.mocked(Recharts.YAxis)).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({ yAxisId: 'left' }),
      undefined
    );
    expect(vi.mocked(Recharts.YAxis)).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({ yAxisId: 'right', orientation: 'right' }),
      undefined
    );
  });

  it('should calculate and pass correct average value to ReferenceLine', () => {
    const simpleData = [
      { date: '2023-01-01T00:00:00Z', revenue: 100000, units: 10 },
      { date: '2023-01-02T00:00:00Z', revenue: 300000, units: 30 },
    ];
    render(<AdvancedAnalyticsChart {...defaultProps} data={simpleData} />);
    triggerResize(1024);

    const expectedAverage = 200000;
    const expectedLabel = 'Avg: $200k';

    expect(vi.mocked(Recharts.ReferenceLine)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        y: expectedAverage,
        yAxisId: 'left',
      }),
      undefined
    );

    expect(vi.mocked(Recharts.Label)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: expectedLabel,
      }),
      undefined
    );
  });

  it('should not render Brush when enableDataBrush is false', () => {
    render(
      <AdvancedAnalyticsChart {...defaultProps} enableDataBrush={false} />
    );
    triggerResize(1024);

    expect(screen.queryByTestId('mock-brush')).not.toBeInTheDocument();
    expect(vi.mocked(Recharts.Brush)).not.toHaveBeenCalled();
  });

  it('should pass mobile-specific props on small viewports', () => {
    render(<AdvancedAnalyticsChart {...defaultProps} />);
    triggerResize(400);

    expect(vi.mocked(Recharts.Legend)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        verticalAlign: 'bottom',
        align: 'center',
      }),
      undefined
    );

    expect(vi.mocked(Recharts.Bar)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        barSize: 12,
      }),
      undefined
    );

    expect(vi.mocked(Recharts.Brush)).toHaveBeenCalled();
    const lastCallArgs = vi.mocked(Recharts.Brush).mock.lastCall;
    expect(lastCallArgs).toBeDefined();

    if (lastCallArgs) {
      const brushProps = lastCallArgs[0];
      expect(brushProps.tickFormatter).toBeDefined();
      if (brushProps.tickFormatter) {
        expect(brushProps.tickFormatter(null, 0)).toBe('');
      }
    }
  });

  it('should pass desktop-specific props on large viewports', () => {
    render(<AdvancedAnalyticsChart {...defaultProps} />);
    triggerResize(1024);

    expect(vi.mocked(Recharts.Legend)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        verticalAlign: 'top',
        align: 'right',
      }),
      undefined
    );

    expect(vi.mocked(Recharts.Bar)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        barSize: 20,
      }),
      undefined
    );

    expect(vi.mocked(Recharts.Brush)).toHaveBeenCalled();
    const lastCallArgs = vi.mocked(Recharts.Brush).mock.lastCall;
    expect(lastCallArgs).toBeDefined();

    if (lastCallArgs) {
      const brushProps = lastCallArgs[0];
      expect(brushProps.tickFormatter).toBeDefined();
      if (brushProps.tickFormatter) {
        expect(brushProps.tickFormatter('2023-01-01T00:00:00Z', 0)).toBe(
          'Dec 31'
        );
      }
    }
  });
});
