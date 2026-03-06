/**
 * Equal Pay Dashboard — Data Model & Helper Functions
 * window.DashboardData namespace
 */
(function () {
  "use strict";

  const employees = [
    // Engineering (6)
    { id: 1,  name: "Erik Lindgren",     department: "Engineering", location: "Stockholm",  gender: "Male",   age: 34, salary: 52000, startDate: "2019-03-15" },
    { id: 2,  name: "Anna Bergström",    department: "Engineering", location: "Stockholm",  gender: "Female", age: 31, salary: 49500, startDate: "2020-01-10" },
    { id: 3,  name: "Johan Karlsson",    department: "Engineering", location: "Gothenburg", gender: "Male",   age: 42, salary: 62000, startDate: "2016-08-22" },
    { id: 4,  name: "Sara Nilsson",      department: "Engineering", location: "Gothenburg", gender: "Female", age: 38, salary: 58000, startDate: "2017-11-05" },
    { id: 5,  name: "Oskar Holm",        department: "Engineering", location: "Stockholm",  gender: "Male",   age: 28, salary: 44000, startDate: "2022-04-01" },
    { id: 6,  name: "Maja Eriksson",     department: "Engineering", location: "Stockholm",  gender: "Female", age: 29, salary: 42500, startDate: "2021-09-12" },

    // Design (5)
    { id: 7,  name: "Lina Johansson",    department: "Design",      location: "Stockholm",  gender: "Female", age: 33, salary: 46000, startDate: "2019-06-20" },
    { id: 8,  name: "Karl Svensson",     department: "Design",      location: "Gothenburg", gender: "Male",   age: 36, salary: 48500, startDate: "2018-02-14" },
    { id: 9,  name: "Elin Gustafsson",   department: "Design",      location: "Stockholm",  gender: "Female", age: 27, salary: 39000, startDate: "2022-07-01" },
    { id: 10, name: "David Pettersson",  department: "Design",      location: "Stockholm",  gender: "Male",   age: 30, salary: 43000, startDate: "2021-01-18" },
    { id: 11, name: "Hanna Olsson",      department: "Design",      location: "Gothenburg", gender: "Female", age: 35, salary: 45500, startDate: "2019-10-30" },

    // Marketing (5)
    { id: 12, name: "Fredrik Larsson",   department: "Marketing",   location: "Stockholm",  gender: "Male",   age: 40, salary: 51000, startDate: "2017-04-10" },
    { id: 13, name: "Sofia Andersson",   department: "Marketing",   location: "Stockholm",  gender: "Female", age: 37, salary: 47500, startDate: "2018-08-25" },
    { id: 14, name: "Maria Persson",     department: "Marketing",   location: "Gothenburg", gender: "Female", age: 32, salary: 43000, startDate: "2020-03-15" },
    { id: 15, name: "Anders Jonsson",    department: "Marketing",   location: "Gothenburg", gender: "Male",   age: 45, salary: 54000, startDate: "2015-12-01" },
    { id: 16, name: "Emma Lindqvist",    department: "Marketing",   location: "Stockholm",  gender: "Female", age: 26, salary: 38000, startDate: "2023-01-09" },

    // Sales (5)
    { id: 17, name: "Niklas Björk",      department: "Sales",       location: "Stockholm",  gender: "Male",   age: 39, salary: 55000, startDate: "2017-09-18" },
    { id: 18, name: "Klara Sandberg",    department: "Sales",       location: "Gothenburg", gender: "Female", age: 34, salary: 50000, startDate: "2019-05-22" },
    { id: 19, name: "Gustav Wallin",     department: "Sales",       location: "Stockholm",  gender: "Male",   age: 44, salary: 60000, startDate: "2015-06-14" },
    { id: 20, name: "Ida Forsberg",      department: "Sales",       location: "Stockholm",  gender: "Female", age: 30, salary: 45000, startDate: "2021-02-28" },
    { id: 21, name: "Pontus Ekström",    department: "Sales",       location: "Gothenburg", gender: "Male",   age: 29, salary: 42000, startDate: "2022-08-15" },

    // HR (4)
    { id: 22, name: "Caroline Hedlund",  department: "HR",          location: "Stockholm",  gender: "Female", age: 41, salary: 48000, startDate: "2016-11-20" },
    { id: 23, name: "Thomas Nyström",    department: "HR",          location: "Stockholm",  gender: "Male",   age: 35, salary: 46000, startDate: "2019-07-08" },
    { id: 24, name: "Rebecka Lund",      department: "HR",          location: "Gothenburg", gender: "Female", age: 28, salary: 37000, startDate: "2022-05-10" },
    { id: 25, name: "Marcus Dahlgren",   department: "HR",          location: "Gothenburg", gender: "Male",   age: 33, salary: 40000, startDate: "2020-09-14" },

    // Finance (5)
    { id: 26, name: "Henrik Åberg",      department: "Finance",     location: "Stockholm",  gender: "Male",   age: 47, salary: 68000, startDate: "2014-01-20" },
    { id: 27, name: "Johanna Ström",     department: "Finance",     location: "Stockholm",  gender: "Female", age: 43, salary: 63000, startDate: "2015-10-05" },
    { id: 28, name: "Daniel Holmberg",   department: "Finance",     location: "Gothenburg", gender: "Male",   age: 36, salary: 55000, startDate: "2018-06-12" },
    { id: 29, name: "Cecilia Fransson",  department: "Finance",     location: "Gothenburg", gender: "Female", age: 31, salary: 48000, startDate: "2021-03-22" },
    { id: 30, name: "Olivia Sjögren",    department: "Finance",     location: "Stockholm",  gender: "Female", age: 25, salary: 36000, startDate: "2023-06-01" }
  ];

  const departments = ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance"];
  const locations = ["Stockholm", "Gothenburg"];

  // Pay gap trend data (percent gap: (male_avg - female_avg) / male_avg * 100)
  const payGapTrend = {
    years: [2020, 2021, 2022, 2023, 2024, 2025],
    sweden:     [8.2, 7.4, 6.5, 5.8, 5.1, 4.8],
    stockholm:  [7.8, 7.0, 6.1, 5.4, 4.9, 4.5],
    gothenburg: [8.9, 8.0, 7.2, 6.3, 5.5, 5.2]
  };

  // Historical average salary data by gender
  const avgSalaryByYear = {
    years: [2020, 2021, 2022, 2023, 2024, 2025],
    female: [38500, 39800, 41200, 42800, 44100, 45200],
    male:   [41800, 42900, 44100, 45400, 46400, 47500]
  };

  // Department-level trend data
  const departmentTrends = {
    years: [2020, 2021, 2022, 2023, 2024, 2025],
    Engineering: [9.0, 8.1, 7.0, 6.1, 5.3, 4.7],
    Design:      [7.5, 6.8, 6.0, 5.5, 5.0, 4.2],
    Marketing:   [8.8, 7.9, 7.1, 6.4, 5.7, 5.4],
    Sales:       [10.2, 9.0, 8.0, 7.1, 6.2, 5.7],
    HR:          [5.5, 5.0, 4.5, 3.8, 3.2, 2.8],
    Finance:     [9.5, 8.5, 7.8, 7.0, 6.0, 5.5]
  };

  // Headcount trend data
  const headcountTrend = {
    years: [2020, 2021, 2022, 2023, 2024, 2025],
    female: [10, 11, 12, 13, 14, 15],
    male:   [16, 16, 16, 16, 15, 15]
  };

  /* ---- Helper Functions ---- */

  function getFilteredEmployees(filters) {
    var result = employees.slice();
    if (filters) {
      if (filters.departments && filters.departments.length > 0) {
        result = result.filter(function (e) {
          return filters.departments.indexOf(e.department) !== -1;
        });
      }
      if (filters.locations && filters.locations.length > 0) {
        result = result.filter(function (e) {
          return filters.locations.indexOf(e.location) !== -1;
        });
      }
      if (filters.gender) {
        result = result.filter(function (e) {
          return e.gender === filters.gender;
        });
      }
    }
    return result;
  }

  function computePayGap(emps) {
    var list = emps || employees;
    var males = list.filter(function (e) { return e.gender === "Male"; });
    var females = list.filter(function (e) { return e.gender === "Female"; });
    if (males.length === 0 || females.length === 0) return 0;
    var maleAvg = males.reduce(function (s, e) { return s + e.salary; }, 0) / males.length;
    var femaleAvg = females.reduce(function (s, e) { return s + e.salary; }, 0) / females.length;
    return parseFloat(((maleAvg - femaleAvg) / maleAvg * 100).toFixed(1));
  }

  function computeAvgSalary(emps) {
    var list = emps || employees;
    if (list.length === 0) return 0;
    return Math.round(list.reduce(function (s, e) { return s + e.salary; }, 0) / list.length);
  }

  function computeMedianSalary(emps, gender) {
    var list = emps || employees;
    if (gender) {
      list = list.filter(function (e) { return e.gender === gender; });
    }
    if (list.length === 0) return 0;
    var sorted = list.map(function (e) { return e.salary; }).sort(function (a, b) { return a - b; });
    var mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }

  function computeGenderDistribution(emps) {
    var list = emps || employees;
    var females = list.filter(function (e) { return e.gender === "Female"; }).length;
    var males = list.length - females;
    var total = list.length || 1;
    return {
      female: females,
      male: males,
      femalePct: Math.round(females / total * 100),
      malePct: Math.round(males / total * 100)
    };
  }

  function computeSalaryDistribution(emps) {
    var list = emps || employees;
    var ranges = [
      { label: "28k-35k", min: 28000, max: 35999, count: 0 },
      { label: "36k-45k", min: 36000, max: 45999, count: 0 },
      { label: "46k-55k", min: 46000, max: 55999, count: 0 },
      { label: "56k-65k", min: 56000, max: 65999, count: 0 },
      { label: "66k-75k", min: 66000, max: 75000, count: 0 }
    ];
    list.forEach(function (e) {
      for (var i = 0; i < ranges.length; i++) {
        if (e.salary >= ranges[i].min && e.salary <= ranges[i].max) {
          ranges[i].count++;
          break;
        }
      }
    });
    return ranges;
  }

  function computeDepartmentGaps(emps) {
    var list = emps || employees;
    var result = {};
    departments.forEach(function (dept) {
      var deptEmps = list.filter(function (e) { return e.department === dept; });
      result[dept] = {
        gap: computePayGap(deptEmps),
        avgFemale: computeAvgSalary(deptEmps.filter(function (e) { return e.gender === "Female"; })),
        avgMale: computeAvgSalary(deptEmps.filter(function (e) { return e.gender === "Male"; })),
        medianFemale: computeMedianSalary(deptEmps, "Female"),
        medianMale: computeMedianSalary(deptEmps, "Male"),
        count: deptEmps.length
      };
    });
    return result;
  }

  function computeDepartmentMedians(emps) {
    var list = emps || employees;
    var labels = [];
    var femaleData = [];
    var maleData = [];
    departments.forEach(function (dept) {
      labels.push(dept);
      var deptEmps = list.filter(function (e) { return e.department === dept; });
      femaleData.push(computeMedianSalary(deptEmps, "Female"));
      maleData.push(computeMedianSalary(deptEmps, "Male"));
    });
    return { labels: labels, female: femaleData, male: maleData };
  }

  function getAvgSalaryByYear() {
    return avgSalaryByYear;
  }

  function getPayGapTrend() {
    return payGapTrend;
  }

  function getDepartmentTrends() {
    return departmentTrends;
  }

  function getHeadcountTrend() {
    return headcountTrend;
  }

  function formatSEK(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " SEK";
  }

  /* ---- Export ---- */
  window.DashboardData = {
    employees: employees,
    departments: departments,
    locations: locations,
    getFilteredEmployees: getFilteredEmployees,
    computePayGap: computePayGap,
    computeAvgSalary: computeAvgSalary,
    computeMedianSalary: computeMedianSalary,
    computeGenderDistribution: computeGenderDistribution,
    computeSalaryDistribution: computeSalaryDistribution,
    computeDepartmentGaps: computeDepartmentGaps,
    computeDepartmentMedians: computeDepartmentMedians,
    getAvgSalaryByYear: getAvgSalaryByYear,
    getPayGapTrend: getPayGapTrend,
    getDepartmentTrends: getDepartmentTrends,
    getHeadcountTrend: getHeadcountTrend,
    formatSEK: formatSEK
  };
})();
