// Course Catalog Data
const courseCatalog = {
    "CS111": {
        id: "CS111",
        code: "CS 111",
        name: "Program Design I",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Introduction to programming: control structures; variables and data types; problem decomposition and procedural programming; input and output; aggregate data structures including arrays"
    },
    "CS141": {
        id: "CS141",
        code: "CS 141",
        name: "Program Design II",
        credits: 3,
        prerequisites: ["CS111"],
        concurrentPrerequisites: ["MATH180"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Data abstraction and modular design; recursion; lists and stacks; dynamic memory allocation; file manipulation"
    },
    "CS151": {
        id: "CS151",
        code: "CS 151",
        name: "Mathematical Foundations of Computing",
        credits: 3,
        prerequisites: ["CS111"],
        concurrentPrerequisites: ["MATH180"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Discrete mathematics concepts fundamental to computing: propositional logic, predicates and quantifiers; proofs; sets; recursive definitions and induction; functions, relations and graphs; combinatorics and discrete probability"
    },
    "CS211": {
        id: "CS211",
        code: "CS 211",
        name: "Programming Practicum",
        credits: 3,
        prerequisites: ["CS141"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Software development tools and practices; debugging and testing; advanced language features; standard libraries; code management"
    },
    "CS251": {
        id: "CS251",
        code: "CS 251",
        name: "Data Structures",
        credits: 4,
        prerequisites: ["CS141", "CS151"],
        concurrentPrerequisites: ["CS211"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Design, usage and analysis of data structures: review of lists, stacks and queues; hash tables, priority queues, search trees, introduction to graphs; searching and sorting; runtime analysis"
    },
    "CS261": {
        id: "CS261",
        code: "CS 261",
        name: "Machine Organization",
        credits: 4,
        prerequisites: ["CS141"],
        concurrentPrerequisites: ["CS211"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Data representation and computer arithmetic; machine language; addressing; memory hierarchy; subroutines; data structures; processor architecture: hardware components, pipelining"
    },
    "CS277": {
        id: "CS277",
        code: "CS 277",
        name: "Technical and Professional Communication in Computer Science",
        credits: 3,
        prerequisites: ["CS141"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Communication skills for computing students and professionals in various contexts: technical writing, portfolios, job interviews, demos, sales, with speech organization, visuals, and delivery"
    },
    "CS301": {
        id: "CS301",
        code: "CS 301",
        name: "Languages and Automata",
        credits: 3,
        prerequisites: ["CS151"],
        concurrentPrerequisites: ["CS251"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Regular sets and finite automata. Context-free languages and push-down automata. Parsing. Computability theory including Turing machines and decidability"
    },
    "CS341": {
        id: "CS341",
        code: "CS 341",
        name: "Programming Language Design and Implementation",
        credits: 3,
        prerequisites: ["CS211", "CS251"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Programming language paradigms, design and implementation: syntax and semantics; parsing; runtime systems; control; data types; subroutines and exceptions; data and procedural abstraction; functional programming"
    },
    "CS342": {
        id: "CS342",
        code: "CS 342",
        name: "Software Design",
        credits: 3,
        prerequisites: ["CS251", "CS211"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Software design principles and practices: Object-oriented design; design patterns; software reuse; testing; event driven programming and concurrency; graphical user interface design and development; Team development"
    },
    "CS361": {
        id: "CS361",
        code: "CS 361",
        name: "Systems Programming",
        credits: 4,
        prerequisites: ["CS251", "CS211", "CS261"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Study of computer systems emphasizing impact on application level programming. Virtual memory and memory management; code optimization; system-level I/O; concurrency: processes, threads, synchronization; introduction to network programming"
    },
    "CS362": {
        id: "CS362",
        code: "CS 362",
        name: "Computer Design",
        credits: 4,
        prerequisites: ["CS211", "CS261"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Computer hardware building blocks. logic gates; combinational circuits; arithmetic circuits; flip flops and sequential circuits; registers and memory; CPU design; I/O design"
    },
    "CS377": {
        id: "CS377",
        code: "CS 377",
        name: "Ethical Issues in Computing",
        credits: 3,
        concurrentPrerequisites: ["CS251"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Communication skills for computing professionals: presentation organization, visual aides, delivery techniques, argument support. Ethical and societal issues in computing: privacy, intellectual property and ownership, crime"
    },
    "CS401": {
        id: "CS401",
        code: "CS 401",
        name: "Computer Algorithms I",
        credits: 3,
        prerequisites: ["CS251"],
        offeredIn: ["Fall", "Spring"],
        category: "core",
        description: "Design and analysis of computer algorithms. Divide-and-conquer, dynamic programming, greedy method, backtracking. Algorithms for sorting, searching, graph computations, pattern matching, NP-complete problems"
    },
    "CS407": {
        id: "CS407",
        code: "CS 407",
        name: "Economics and Computation",
        credits: 3,
        prerequisites: ["CS251"],
        offeredIn: ["Fall", "Spring"],
        category: "elective",
        description: "Techniques for analysis of markets, making decisions with other strategic agents, and understanding how algorithms affect the incentives of market participants. These include game theory, mechanism design, auction theory, and social choice theory."
    },
    "CS411": {
        id: "CS411",
        code: "CS 411",
        name: "Artificial Intelligence I",
        credits: 3,
        prerequisites: ["CS251"],
        offeredIn: ["Fall", "Spring"],
        category: "elective",
        description: "Definitions of intelligence and AI, autonomous agents, architectures of agents and types of environments, search techniques, adversarial search, search in complex environments, logic and probability, learning, generative AI."
    },
    "CS418": {
        id: "CS418",
        code: "CS 418",
        name: "Introduction to Data Science",
        credits: 3,
        prerequisites: ["CS251"],
        concurrentPrerequisites: ["STAT381", "IE342"],
        offeredIn: ["Fall", "Spring"],
        category: "elective",
        description: "Provides an in-depth overview of data science in engineering. Topics include modeling, storage, manipulation, integration, classification, analysis, visualization, information extraction, and big data in the engineering domain."
    },
    "CS422": {
        id: "CS422",
        code: "CS 422",
        name: "User Interface Design and Programming",
        credits: 3,
        prerequisites: ["CS342"],
        offeredIn: ["Fall", "Spring"],
        category: "elective",
        description: "User interface design, implementation, and evaluation: user-centered design methodologies, windowing systems, I/O devices and techniques, event-loop programming, user studies. Programming projects."
    },
    "CS440": {
        id: "CS440",
        code: "CS 440",
        name: "Software Engineering I",
        credits: 3,
        prerequisites: ["CS342"],
        offeredIn: ["Fall", "Spring"],
        category: "elective",
        description: "Software life-cycle model, requirement specification techniques, large-scale software design techniques and tools, implementation issues, testing and debugging techniques, software maintenance."
    },
    "CS351": {
        id: "CS351",
        code: "CS 351",
        name: "Advanced Data Structure Practicum",
        credits: 3,
        prerequisites: ["CS251", "CS211"],
        offeredIn: ["Fall", "Spring"],
        category: "elective",
        description: "Design and implementation details of advanced data structure and non-trivial algorithms with an emphasis on amortized analysis."
    },
    "MATH180": {
        id: "MATH180",
        code: "MATH 180",
        name: "Calculus I",
        credits: 4,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Differential and integral calculus"
    },
    "MATH181": {
        id: "MATH181",
        code: "MATH 181",
        name: "Calculus II",
        credits: 4,
        prerequisites: ["MATH180"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Techniques of integration, arc length, solids of revolution, applications, polar coordinates, parametric equations, infinite sequences and series, power series"
    },
    "MATH210": {
        id: "MATH210",
        code: "MATH 210",
        name: "Calculus III",
        credits: 3,
        prerequisites: ["MATH181"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Vectors in space, functions of several variables, partial differential and optimization, multiple integrals, vector fields, Green's Theorem, Stokes Theorem"
    },
    "ENGL160": {
        id: "ENGL160",
        code: "ENGL 160",
        name: "Academic Writing I: Writing in Academic and Public Contexts",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "general",
        description: "Students write in a variety of genres with an emphasis on argument and sentence-level grammar. Topics vary by section"
    },
    "ENGL161": {
        id: "ENGL161",
        code: "ENGL 161",
        name: "Academic Writing II: Writing for Inquiry and Research",
        credits: 3,
        prerequisites: ["ENGL160"],
        offeredIn: ["Fall", "Spring"],
        category: "general",
        description: "Students learn about academic inquiry and complete several writing projects including a documented research paper. Topics vary by section"
    },
    "GEN101": {
        id: "GEN101",
        code: "GEN 101",
        name: "Exploring World Cultures",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "general",
        description: "Exploring World Cultures course"
    },
    "GEN102": {
        id: "GEN102",
        code: "GEN 102",
        name: "Understanding the Creative Arts",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "general",
        description: "Understanding the Creative Arts course"
    },
    "GEN103": {
        id: "GEN103",
        code: "GEN 103",
        name: "Understanding the Past",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "general",
        description: "Understanding the Past course"
    },
    "GEN104": {
        id: "GEN104",
        code: "GEN 104",
        name: "Understanding the Individual and Society",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "general",
        description: "Understanding the Individual and Society course"
    },
    "GEN105": {
        id: "GEN105",
        code: "GEN 105",
        name: "Understanding U.S. Society",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "general",
        description: "Understanding U.S. Society course"
    },
    "GEN106": {
        id: "GEN106",
        code: "GEN 106",
        name: "Humanities/Social Sciences/Art Electives",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "general",
        description: "Humanities/Social Sciences/Art Electives"
    },
    "GEN107": {
        id: "GEN107",
        code: "GEN 107",
        name: "Humanities/Social Sciences/Art Electives",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "general",
        description: "Humanities/Social Sciences/Art Electives"
    },
    "IE342": {
        id: "IE342",
        code: "IE 342",
        name: "Probability and Statistics for Engineers",
        credits: 3,
        prerequisites: ["MATH181"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Probability, random variables, mathematical expectation, discrete and continuous distributions, sampling distributions, estimation theory, and test of hypothesis"
    },
    "STAT381": {
        id: "STAT381",
        code: "STAT 381",
        name: "Applied Statistical Methods I",
        credits: 3,
        prerequisites: ["MATH181"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Graphical and tabular representation of data; Introduction to probability, random variables, sampling distributions, estimation, confidence intervals, and tests of hypotheses. Includes SAS and SPSSX applications"
    },
    "MATH215": {
        id: "MATH215",
        code: "MATH 215",
        name: "Introduction to Advanced Mathematics",
        credits: 3,
        prerequisites: ["MATH181"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Introduction to methods of proofs used in different fields in mathematics"
    },
    "MATH220": {
        id: "MATH220",
        code: "MATH 220",
        name: "Introduction to Differential Equations",
        credits: 3,
        prerequisites: ["MATH210"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Techniques and applications of differential equations, first and second order equations, Laplace transforms, series solutions, graphical and numerical methods, and partial differential equations"
    },
    "MATH218": {
        id: "MATH218",
        code: "MATH 218",
        name: "Applied Linear Algebra",
        credits: 3,
        prerequisites: ["MATH181"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Matrices, row reduction algorithm, vector spaces, LU-decomposition, orthogonality, Gram-Schmidt process, determinants, inner products, eigenvalue problems, applications to differential equations and Markov processes"
    },
    "MATH320": {
        id: "MATH320",
        code: "MATH 320",
        name: "Linear Algebra I",
        credits: 3,
        prerequisites: ["MATH215"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Linear equations, Gaussian elimination, matrices, vector spaces, linear transformations, determinants, eigenvalues and eigenvectors"
    },
    "MATH430": {
        id: "MATH430",
        code: "MATH 430",
        name: "Formal Logic I",
        credits: 3,
        prerequisites: ["MATH215"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "First order logic, syntax and semantics, completeness-incompleteness"
    },
    "MATH435": {
        id: "MATH435",
        code: "MATH 435",
        name: "Foundations of Number Theory",
        credits: 3,
        prerequisites: ["MATH215"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Primes, divisibility, congruences, Chinese remainder theorem, primitive roots, quadratic residues, quadratic reciprocity, and Jacobi symbols. The Euclidean algorithm and strategies of computer programming"
    },
    "MATH436": {
        id: "MATH436",
        code: "MATH 436",
        name: "Number Theory for Applications",
        credits: 3,
        prerequisites: ["MATH435"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Primality testing methods of Lehmer, Rumely, Cohen-Lenstra, Atkin. Factorization methods of Gauss, Pollard, Shanks, Lenstra, and quadratic sieve. Computer algorithms involving libraries and nested subroutines"
    },
    "MCS421": {
        id: "MCS421",
        code: "MCS 421",
        name: "Combinatorics",
        credits: 3,
        prerequisites: ["MATH215", "MATH218"],
        concurrentPrerequisites: ["MATH320"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "The pigeonhole principle, permutations and combinations, binomial coefficients, inclusion-exclusion principle, recurrence relations and generating functions, special counting sequences, Polya theory of counting"
    },
    "MCS423": {
        id: "MCS423",
        code: "MCS 423",
        name: "Graph Theory",
        credits: 3,
        prerequisites: ["MATH215", "MATH218"],
        concurrentPrerequisites: ["MATH320"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Basic concepts of graph theory including Eulerian and hamiltonian cycles, trees, colorings, connectivity, shortest paths, minimum spanning trees, network flows, bipartite matching, planar graphs"
    },
    "MCS471": {
        id: "MCS471",
        code: "MCS 471",
        name: "Numerical Analysis",
        credits: 3,
        prerequisites: ["CS111"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Introduction to numerical analysis; floating point arithmetic, computational linear algebra, iterative solution to nonlinear equations, interpolation, numerical integration, numerical solution of ODEs, computer subroutine packages"
    },
    "STAT401": {
        id: "STAT401",
        code: "STAT 401",
        name: "Introduction to Probability",
        credits: 3,
        prerequisites: ["MATH210"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Probability spaces, random variables and their distributions, conditional distribution and stochastic independence, special distributions, sampling distributions, limit theorems"
    },
    "STAT473": {
        id: "STAT473",
        code: "STAT 473",
        name: "Game Theory",
        credits: 3,
        prerequisites: ["STAT381"],
        offeredIn: ["Fall", "Spring"],
        category: "math",
        description: "Introduction to the basic ideas of game theory. Static and dynamic games; mixed strategies, imperfect information; economic, political and biological applications"
    },
    "BIOS110": {
        id: "BIOS110",
        code: "BIOS 110",
        name: "Biology of Cells and Organisms",
        credits: 4,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "Introductory biology at the molecular, cellular, and organismal level. Topics include: Scientific skills, biological chemistry, cell structure and function, metabolism, cell division, molecular genetics, diversity, anatomy and physiology."
    },
    "BIOS120": {
        id: "BIOS120",
        code: "BIOS 120",
        name: "Biology of Populations and Communities",
        credits: 4,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "Introductory biology at the level of populations and communities. Topics include: Scientific skills, evolution, Mendelian and population genetics, biological diversity, and ecological systems including ecosystem processes and human impacts."
    },
    "CHEM122": {
        id: "CHEM122",
        code: "CHEM 122",
        name: "Matter and Energy",
        credits: 3,
        prerequisites: [""],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "An introductory one-semester course in chemical principles, including the quantum model of the atom, periodicity, bonding, reaction types, solutions, stoichiometry, thermochemistry, intermolecular forces, chemical equilibrium, acid-base equilibria."
    },
    "CHEM123": {
        id: "CHEM123",
        code: "CHEM 123",
        name: "Foundations of Chemical Inquiry I",
        credits: 2,
        prerequisites: [""],
        concurrentPrerequisites: ["CHEM122"],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "Laboratory in general chemistry, including the quantum model of the atom, stoichiometry, periodicity, reaction types, intermolecular forces, and pH."
    },
    "CHEM116": {
        id: "CHEM116",
        code: "CHEM 116",
        name: "Honors and Majors General and Analytical Chemistry I",
        credits: 5,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "General and analytical chemistry with laboratory. Coverage of the fundamentals of chemistry including stoichiometry and equilibrium. Coverage of the principles of analytical chemistry, including the use of instrumentation."
    },
    "CHEM124": {
        id: "CHEM124",
        code: "CHEM 124",
        name: "Chemical Dynamics",
        credits: 3,
        prerequisites: ["CHEM122", "CHEM123"],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "A second semester course in chemical principles including chemical thermodynamics, phase transitions, spontaneity/equilibrium, electrochemistry, kinetics, bonding, molecular spectroscopy, coordination compounds, and buffer solutions."
    },
    "CHEM125": {
        id: "CHEM125",
        code: "CHEM 125",
        name: "Foundations of Chemical Inquiry II",
        credits: 2,
        prerequisites: ["CHEM122", "CHEM123"],
        concurrentPrerequisites: ["CHEM124"],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "Laboratory in general chemistry including chemical thermodynamics, spontaneity, chemical equilibrium, acid-base equilibrium, electrochemistry, kinetics, bonding, order/symmetry in condensed phases, coordination compounds, and spectroscopy."
    },
    "CHEM118": {
        id: "CHEM118",
        code: "CHEM 118",
        name: "Honors and Majors General and Analytical Chemistry II",
        credits: 5,
        prerequisites: ["CHEM116"],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "General and analytical chemistry with laboratory. Coverage of the fundamentals of chemistry including atomic and molecular structure, thermodynamics, and kinetics. Coverage of principles of analytical chemistry, including the use of instrumentation."
    },
    "PHYS141": {
        id: "PHYS141",
        code: "PHYS 141",
        name: "General Physics I (Mechanics)",
        credits: 4,
        prerequisites: [],
        concurrentPrerequisites: ["MATH180"],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "Kinematics, vectors, Newton's laws of motion; linear momentum, collisions; work and kinetic energy; potential energy, conservation of energy; rotational kinematics and energy; rotational dynamics, static equilibrium; simple harmonic motion."
    },
    "PHYS142": {
        id: "PHYS142",
        code: "PHYS 142",
        name: "General Physics II (Electricity and Magnetism)",
        credits: 4,
        prerequisites: ["PHYS141"],
        concurrentPrerequisites: ["MATH181"],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "Electrostatics; electric currents; d-c circuits; magnetic fields; magnetic media; electromagnetic induction; a-c circuits; Maxwell's equations; electromagnetic waves; reflection and refraction; interference; geometrical optics."
    },
    "EAES101": {
        id: "EAES101",
        code: "EAES 101",
        name: "Global Environmental Change",
        credits: 4,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "Natural and anthropogenic controls on the structure and evolution of the earth's surface environment. Interactions among the Earth's solid surface, hydrosphere, atmosphere, and biosphere and human impacts on these processes."
    },
    "EAES111": {
        id: "EAES111",
        code: "EAES 111",
        name: "Earth, Energy, and the Environment",
        credits: 4,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "science",
        description: "Nature and evolution of Earth from the scale of minerals and rocks to tectonic plates. Earthquakes and volcanoes, their hazards and effects on humans. Natural resources, sources of energy, and their environmental impacts."
    },
    "FREE001": {
        id: "FREE001",
        code: "FREE 001",
        name: "Free Elective I",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "elective",
        description: "Free elective course - placeholder"
    },
    "FREE002": {
        id: "FREE002",
        code: "FREE 002",
        name: "Free Elective II",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "elective",
        description: "Free elective course - placeholder"
    },
    "FREE003": {
        id: "FREE003",
        code: "FREE 003",
        name: "Free Elective III",
        credits: 3,
        prerequisites: [],
        offeredIn: ["Fall", "Spring"],
        category: "elective",
        description: "Free elective course - placeholder"
    }
};

// Sample Transfer Credits
const sampleTransferCredits = [
    {
        id: "transfer1",
        externalCourse: "Intro to Algorithms",
        uicEquivalent: "CS251",
        status: "approved",
        credits: 3,
        mapped: false
    },
    {
        id: "transfer2",
        externalCourse: "Programming Fundamentals",
        uicEquivalent: "CS111",
        status: "approved",
        credits: 4,
        mapped: false
    }
];

// Default Elective Suggestions
const electiveSuggestions = {
    "CS411": "Computer Graphics",
    "CS422": "User Interface Design",
    "CS440": "Artificial Intelligence",
    "CS450": "Computer Networks",
    "CS473": "Object-Oriented Design"
};

// Generate semester list (8 semesters from current)
function generateSemesters(startYear = 2025, startTerm = "Fall", includeSummer = false) {
    const semesters = [];
    const terms = includeSummer ? ["Fall", "Spring", "Summer"] : ["Fall", "Spring"];
    const termOrder = { "Fall": 0, "Spring": 1, "Summer": 2 };
    let currentYear = startYear;
    let termIndex = termOrder[startTerm] !== undefined ? termOrder[startTerm] : 0;
    
    // Generate 8 semesters (or more if including Summer to cover similar time span)
    const totalSemesters = includeSummer ? 12 : 8;
    
    for (let i = 0; i < totalSemesters; i++) {
        semesters.push({
            id: `${terms[termIndex]}${currentYear}`,
            term: terms[termIndex],
            year: currentYear,
            courses: [],
            credits: 0,
            status: i === 0 ? "current" : "planned"
        });
        
        // Move to next term and handle year increment
        // Academic year sequence: Fall 2025 -> Spring 2026 -> Fall 2026 -> Spring 2027
        const currentTerm = terms[termIndex];
        
        // Increment term index for next iteration
        termIndex++;
        
        // Handle year increment based on term sequence
        if (termIndex >= terms.length) {
            // Wrapped around to the beginning of terms array (Spring -> Fall)
            termIndex = 0;
            // Year stays the same when going from Spring to Fall (Spring 2026 -> Fall 2026)
        } else if (currentTerm === "Fall" && terms[termIndex] === "Spring") {
            // Fall -> Spring: Spring is in the next calendar year
            // Fall 2025 -> Spring 2026
            currentYear++;
        }
    }
    
    return semesters;
}

