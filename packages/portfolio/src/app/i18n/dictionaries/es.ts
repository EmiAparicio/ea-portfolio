const es = {
  global: {
    loading: 'Cargando...',
    copy: {
      msgFallback: '¡Copiado al portapapeles!',
      errFallback: '¡Ups! La copia falló.',
    },
  },
  menu: {
    labels: {
      menu: 'Menú',
      skills: {
        main: 'Habilidades',
        gaming: 'Juegos',
        webdev: 'Desarrollo',
        eng: 'Ingeniería',
      },
      contact: { main: 'Contacto' },
    },
    email: 'Email copiado: emilianojaparicio@gmail.com',
  },
  pages: {
    titles: {
      webdev: 'Desarrollador Frontend',
      gaming: 'Diseñador de Juegos',
      eng: 'Bioingeniero',
      seedlings: 'Encuesta de Seedlings',
    },
    landing: {
      text: 'Soy <b>bioingeniero</b> y profesor, <b>desarrollador frontend</b> y amante de los gatos, con una pasión de toda la vida por la tecnología y la programación. Completé mi investigación doctoral en ingeniería antes de enfocar mi camino hacia la tecnología creativa. También soy un absolutista del metal sinfónico y <b>diseñador de videojuegos</b> indie. Actualmente me dedico al desarrollo web, a la enseñanza de matemática y física, y a mi emprendimiento de videojuegos <i>Oblivion Mechanics</i>.',
    },
    webdev: {
      text: 'Desarrollador <b>Frontend</b> con experiencia en <b>React</b> y <b>TypeScript</b>, con foco en UX/UI y en crear aplicaciones modernas, fluidas y gamificadas. Mi recorrido como desarrollador combina aplicaciones en investigación académica y desarrollo profesional, con un enfoque fuerte en usabilidad, escalabilidad y diseño visual.',
      resume: 'Currículum',
      downloadCv: 'Descargar CV',
      downloadCvLabel: 'Descargar<br/>CV',
      github: 'Ir al<br/>Repositorio',
      experienceButton: 'Experiencia',
      experienceText:
        '<i>Experiencia</i><br/><br/>Formalmente me desempeñé como <b>Frontend Developer</b> en CityHeroes durante 2 años:<br/><ul><li><b> Frameworks y librerías:</b> principalmente React y TypeScript, menos de Next.js y React Native</li><li><b> Estilos y UI:</b> TailwindCSS, MUI, Radix, Shadcn, Figma, Storybook</li><li><b> Estado y data:</b> Jotai, React Query, RxDB, PowerSync</li><li><b> Animación y validación:</b> Framer Motion, Zod</li><li><b> Internacionalización y tooling:</b> i18n, Vite</li><li><b> Mapas y datos espaciales:</b> Mapbox</li></ul>Además, colaboré en la creación de un paquete de componentes publicado en <a href="https://www.npmjs.com/package/@cityheroes/ui">npm</a>.<br/><br/>Desde 2022 he desarrollado <b>proyectos personales y académicos</b> con foco en UX/UI, experimentando con diferentes tecnologías relacionadas con React apalancado con el uso de IA, en la construcción de interfaces fluidas y escalables.<br/>Durante mi doctorado en bioingeniería (6 años) trabajé como programador científico, utilizando lenguajes y herramientas como:<br/><ul><li><b> Lenguajes:</b> Python, C++, Batch/Bash</li><li><b> Software científico:</b> LAMMPS, NetLogo, MATLAB, LaTeX, FoamExplorer (desarrollo propio)</li></ul>',
      invasionToursInfo:
        '<b>Invasion Tours</b><br/><br/>Este proyecto individual fue una aplicación web académica que ofrecía información sobre todos los países del mundo. Permitía buscar países, ver detalles como capitales, continentes y otros datos relevantes, y explorarlos a través de un mapa.<br/><br/> Las tecnologías principales utilizadas para su desarrollo fueron: <ul> <li>• React para la construcción de la interfaz de usuario.</li> <li>• Redux para la gestión del estado de la aplicación.</li> <li>• Node.js con Express para la creación del servidor backend.</li> <li>• Sequelize junto a PostgreSQL para la gestión y almacenamiento de la base de datos.</li> <li>• CSS para la implementación de estilos visuales.</li> </ul><br/>Además, se agregó una funcionalidad especial que incluye un minijuego de búsqueda de pistas en la web, que activaba diferentes temas visuales con una temática de aliens e invasiones, proporcionando una experiencia interactiva y divertida para el usuario.',
      starcardsInfo:
        '<b>StarCards</b><br/><br/>Este proyecto fue una aplicación web de un juego de cartas inspirado en StarCraft que incluía funcionalidades de comercio electrónico, desarrollado como proyecto grupal final.<br/><br/> Las tecnologías principales que se utilizaron fueron: <ul> <li>• HTML, CSS y JavaScript para el desarrollo frontend.</li> <li>• React y Redux para la construcción de la interfaz y gestión del estado.</li> <li>• Node.js y Express para el desarrollo del servidor backend.</li> <li>• Sequelize para la gestión de la base de datos PostgreSQL.</li> <li>• JWT, Nodemailer y Passport para autenticación y manejo de usuarios.</li> <li>• Socket.io y Firebase para funcionalidades en tiempo real y conexión.</li> </ul> <br/><br/>Entre las funcionalidades destacaron el registro de usuarios (incluyendo inicio con Google), la verificación de correo, la exploración de la tienda con productos y carrito, la integración con MercadoPago para pagos, perfiles de usuario con inventario y chats privados, moderación por administradores, y una sala de juego con ranking, historial y chat público, que soportaba partidas en tiempo real.',
      portfolioButton: 'Portafolio',
      portfolioText:
        'Este portafolio es un proyecto en sí mismo, diseñado para demostrar un conjunto de habilidades en el desarrollo web. Construido con <b>Next.js</b>, prioriza la optimización para motores de búsqueda (SEO) mediante el <i>server-side rendering (SSR)</i>, complementado con un enrutamiento del lado del cliente para una navegación fluida y sin esperas. La experiencia del usuario está enriquecida con elementos interactivos, desde <b>audio dinámico en los botones</b> hasta <b>animaciones con Framer Motion</b>, y efectos visuales generados con Canvas y SVG.<br/><br/>La arquitectura del proyecto está pensada para ser robusta y escalable. Para la gestión del estado global, se utiliza <b>Jotai</b>, incluyendo la persistencia con <i>sessionStorage</i>. La estilización es una combinación de <b>CSS nativo y Tailwind v4</b>. La mayoría de los componentes se construyeron desde cero, mientras que algún otro usa la librería <b>Radix UI</b>. La estructura multilingüe se implementa de forma nativa, inspirada en <b>i18n</b>, para un control total del contenido.<br/><br/>Adicionalmente, el proyecto demuestra un enfoque en la <b>medición de rendimiento en tiempo real</b> y la mejora continua. Para garantizar la calidad y estabilidad del código, integra <b>Husky</b> para pre-commit hooks y un <b>pipeline de CI/CD</b>. Estos mecanismos de control automatizados ejecutan validaciones de <b>Eslint</b> y <b>Prettier</b>, junto con los tests de <b>Vitest</b> y <b>Storybook</b>, antes de que cualquier código pueda ser integrado (commit) o desplegado (deploy). Esta metodología, apalancada en la <i>inteligencia artificial</i> para resolver problemas complejos, me permite acelerar el ciclo de desarrollo y crear soluciones más eficientes y de alta calidad.',
      visitWeb: 'Ir al Sitio',
      uiPkgButton: 'Demo<br/>Paquete UI',
      uiPkgInfo:
        'Este proyecto es una demo interactiva de una librería de componentes de UI personalizada. El objetivo principal es demostrar el desarrollo de componentes escalables y bien documentados, utilizando <b>Radix UI</b> como base para la accesibilidad y el comportamiento, listos para ser utilizados en cualquier aplicación React. Se utiliza <b>Storybook</b> para la documentación interactiva y las pruebas visuales de la API de cada componente.<br/><br/>Actualmente, esta demo explora diversas técnicas de estilizado, combinando <b>SCSS (Sass)</b> y <b>Styled Components (CSS-in-JS)</b>, visualización de datos avanzada con <b>Recharts</b> y <b>D3.js</b>, y la implementación de pruebas unitarias con <b>Vitest</b> y <b>React Testing Library</b>.',
    },
    gaming: {
      text: '<b>Diseñador de juegos</b> Indie enfocado en la creación de mecánicas con componentes de <b>economía</b> y <b>sistemas dinámicos auto-balanceados</b>. Mi objetivo es construir experiencias estratégicas, rejugables y con mercados entre jugadores como parte esencial del diseño; a través de mi empresa: <i>Oblivion Mechanics</i>.',
      obm: 'Oblivion<br/>Mechanics',
      oblivionText:
        "<a href='https://oblivionmechanics.com'><b>Oblivion Mechanics</b></a> es una empresa Indie, fundada a comienzos del 2022, enfocada principalmente en el <b>diseño de videojuegos</b> donde el balance de las mecánicas, la estrategia y la libertad de los jugadores sean prioridad. Nuestro mayor objetivo es hacer crecer la industria de los videojuegos independientes desde las variantes multijugador con fuerte énfasis en economías de mercado entre jugadores.",
      visitWeb: 'Ir al Sitio',
      univearthInfo:
        "<a href='https://uvegame.com'><b>Univearth</b></a> es un proyecto de <i>videojuego</i> móvil Indie, multijugador, de cartas coleccionables, con mecánicas que combinan exploración, recolección de recursos, armado de mazos y batallas en tiempo real. Cada jugador personificará un comandante del bando terrestre o alien.<br/><br/>Se hace uso de <i>Inteligencia Artificial</i> para acelerar procesos de diseño visual, con retoques y correcciones manuales hechas por artistas. También se apunta a conseguir financiamiento a través de preventas en la <i>blockchain</i>, demostrando a su vez que es una herramienta que puede aprovecharse sin crear estafas piramidales.<br/><br/><i>Mi rol</i> en el proyecto ha sido el de: fundador, gerente de proyecto, diseñador del juego tanto en sus mecánicas como en sus aspectos visuales y conceptuales, ingeniero de prompts de IA, y desarrollador web.",
    },
    eng: {
      text: '<b>Bioingeniero</b> de la Universidad de Mendoza, con experiencia docente e investigadora. Mi trayectoria incluye una <i>beca doctoral CONICET</i>, publicaciones internacionales en simulaciones atomísticas y años como profesor.<br/><br/><b>Título de grado</b><br/>Abanderado Nacional 2014, medalla de oro, y uno de los mejores promedios entre los egresados de ingeniería de Argentina (Premio de la Academia Nacional de Ingeniería). Realicé prácticas profesionales en el laboratorio del <b>INBIOMED</b> y desarrollé trabajo de tesis sobre simulaciones computacionales de biomateriales.<br/><br/><b>Beca doctoral CONICET</b><br/>Desarrollo de trabajo de investigación en simulaciones atomísticas: <b>8 publicaciones científicas</b>. Herramientas y lenguajes utilizados:<br/> <ul><li><b>Simulación y visualización:</b> LAMMPS, OVITO, Gnuplot</li><li><b>Lenguajes y scripting:</b> C++, MATLAB, Python, Bash</li><li><b>Documentación científica:</b> LaTeX</li><li><b>Modelado multiagente:</b> NetLogo</li></ul><br/><b>Docencia</b><br/><ul><li><b>3 años:</b> Biomateriales (4.º año de la carrera de Bioingeniería).</li><li><b>3 años:</b> Física (nivel preuniversitario).</li><li><b>Actual:</b> Cálculo II (2.º año de Ingeniería).</li><li>Clases particulares de matemática y física (todos los niveles).</li></ul>',
      resume: 'Currículum',
      downloadCv: 'Descargar CV',
      downloadCvLabel: 'Descargar<br/>CV',
      researchButton: 'Investigación',
      author: 'Autor',
      coauthor: 'Coautor',
    },
  },
} as const;

export default es;
