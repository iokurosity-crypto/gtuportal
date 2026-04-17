// Department Logos Mapping for LDCE
// These are the ACTUAL logo images from LDCE official website
// Each department has UNIQUE, CORRECT logo mapping

const DEPARTMENT_LOGOS = {
  // Core UG Departments - UNIQUE LOGOS
  "Civil Engineering": "/departments_files/yKUwio9IfwP4CYOBv6dTH1GUjuRMlOO6NsK329sA.png",
  "Electrical Engineering": "/departments_files/IljPs1zDVaynbAXnmQMfABnarTB9SMnpcrXEiZlX.png",
  "Computer Engineering": "/departments_files/nVruHn1fui7O5a64RQ1djFiUadu9k9T94xlzOUqE.png",
  "Information Technology": "/departments_files/sz1TzLjT69tvnU3nm1iJ87ARUWGTrOfdZRynV79T.png",
  "Instrumentation & Control Engineering": "/departments_files/Gzr9Is0Q1Jhcn9T1qWIIEuHQlloiZEex1wZmxYxu.png",
  "Instrumentation and Control Engineering": "/departments_files/Gzr9Is0Q1Jhcn9T1qWIIEuHQlloiZEex1wZmxYxu.png",
  "Instrumentation  and Control Engineering Department (NBA ACCREDITED 2021-2027)": "/departments_files/Gzr9Is0Q1Jhcn9T1qWIIEuHQlloiZEex1wZmxYxu.png",
  "Mechanical Engineering": "/departments_files/hQCDbdNDWw8STLpisN1Zlax2UnFMpqtgV3xxSvd5.png",
  "Applied Mechanics": "/departments_files/GDn30j7kUBxfsLbAap5Lzf1ZiLSh6WVYN13X5pc1.png",
  "Chemical Engineering": "/departments_files/kYVwH3Ey0kTizxArncIHKNPp3snecjQt34zbGcJV.png",
  "Plastic Technology": "/departments_files/ApHxTZ5Ag5hejDcDuSkABotB9yyUCwtchoZKxWfq.png",
  "Rubber Technology": "/departments_files/PEfuZyv6zur8DOjRUtgmxUN0wszedMnpRfZ4Q8sD.png",
  "Textile Technology": "/departments_files/AFkZzoixGdAKMC1cktjl49qdGfwGezBSU6vALnST.png",
  "Electronics & Communication Engineering": "/departments_files/saAx3pILtjIUKizfPByZ10s2xwWuccQdROfonpUV.png",
  "Electronics and Communication Engineering": "/departments_files/saAx3pILtjIUKizfPByZ10s2xwWuccQdROfonpUV.png",
  "Environmental Engineering": "/departments_files/Ee1riWaNdFrOho2bci1Y6xfnYiKETrgcP7hvmxVg.png",
  "Environment Engineering": "/departments_files/Ee1riWaNdFrOho2bci1Y6xfnYiKETrgcP7hvmxVg.png",
  "Biomedical Engineering": "/departments_files/2god3Qzhwh8o4PfKq8uSQ8NnXPm8rs1WxaDaycPs.png",
  "Automobile Engineering": "/departments_files/S5V6CLfrB3TRChDwlOD2g8aave9DhDF5V1HCwMRM.jpg",
  "Artificial Intelligence and Machine Learning": "/departments_files/8fuYH4Rp61SFsfr36uUNAl0KJea0pgzbrLi2FjYs.png",
  "Robotics and Automation": "/departments_files/7rp2rLSOlpIfAmhOKz2M1f9d9whZ0ANt9fa3ZGOc.png",
  
  // Other entries
  "Science and Humanities": "/departments_files/IWo2UwQBYadcY65AuxZnJCnwnPyWl2lSpL4OuJPF.png",
  "Student Section": "/departments_files/4Hl4aRlkUjygrNNXNJ7vZ0dzdW6bmF1SSYveQETE.png",

  "default": "/departments_files/nVruHn1fui7O5a64RQ1djFiUadu9k9T94xlzOUqE.png"
};

/**
 * Get the logo path for a given department
 * Uses exact mapping from LDCE official website
 * @param {string} department - The department name
 * @returns {string} - The path to the correct logo image
 */
export const getDepartmentLogo = (department) => {
  if (!department || typeof department !== 'string') {
    return DEPARTMENT_LOGOS.default;
  }

  // Try exact match first
  if (DEPARTMENT_LOGOS[department]) {
    return DEPARTMENT_LOGOS[department];
  }

  // Normalize for matching
  const name = department.toLowerCase().trim();

  // Specific department matching (case-insensitive)
  if (name.includes("civil")) {
    return DEPARTMENT_LOGOS["Civil Engineering"];
  }
  if (name.includes("electrical") && !name.includes("electronics")) {
    return DEPARTMENT_LOGOS["Electrical Engineering"];
  }
  if (name.includes("computer")) {
    return DEPARTMENT_LOGOS["Computer Engineering"];
  }
  if (name.includes("information") || name.includes("i.t") || (name.includes("it") && !name.includes("biomedical"))) {
    return DEPARTMENT_LOGOS["Information Technology"];
  }
  if (name.includes("instrumentation") || name.includes("control")) {
    return DEPARTMENT_LOGOS["Instrumentation & Control Engineering"];
  }
  if (name.includes("mechanical")) {
    return DEPARTMENT_LOGOS["Mechanical Engineering"];
  }
  if (name.includes("applied")) {
    return DEPARTMENT_LOGOS["Applied Mechanics"];
  }
  if (name.includes("chemical")) {
    return DEPARTMENT_LOGOS["Chemical Engineering"];
  }
  if (name.includes("plastic")) {
    return DEPARTMENT_LOGOS["Plastic Technology"];
  }
  if (name.includes("rubber")) {
    return DEPARTMENT_LOGOS["Rubber Technology"];
  }
  if (name.includes("textile")) {
    return DEPARTMENT_LOGOS["Textile Technology"];
  }
  if (name.includes("electronics") || name.includes("communication")) {
    return DEPARTMENT_LOGOS["Electronics and Communication Engineering"];
  }
  if (name.includes("environmental") || name.includes("environment")) {
    return DEPARTMENT_LOGOS["Environmental Engineering"];
  }
  if (name.includes("biomedical")) {
    return DEPARTMENT_LOGOS["Biomedical Engineering"];
  }
  if (name.includes("automobile")) {
    return DEPARTMENT_LOGOS["Automobile Engineering"];
  }
  if (name.includes("artificial") || name.includes("machine learning") || name.includes("ai")) {
    return DEPARTMENT_LOGOS["Artificial Intelligence and Machine Learning"];
  }
  if (name.includes("robotics") || name.includes("automation")) {
    return DEPARTMENT_LOGOS["Robotics and Automation"];
  }
  if (name.includes("science") || name.includes("humanities")) {
    return DEPARTMENT_LOGOS["Science and Humanities"];
  }
  if (name.includes("student")) {
    return DEPARTMENT_LOGOS["Student Section"];
  }

  return DEPARTMENT_LOGOS.default;
};

export default DEPARTMENT_LOGOS;
