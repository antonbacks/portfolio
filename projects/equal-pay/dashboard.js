/**
 * Equal Pay Dashboard — Interactivity
 * Single IIFE, Chart.js 4.x
 */
(function () {
  "use strict";

  var D = window.DashboardData;
  var charts = {};
  var activeFilters = { departments: [], locations: [] };
  var sortState = { col: null, dir: "asc" };
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ========== INIT ========== */
  function init() {
    buildFilterDropdowns();
    renderAll();
    bindTabs();
    bindBanner();
    bindDatePicker();
    bindToolbarDropdowns();
    bindFilterPanel();
    bindDownload();
    bindTableSort();
    if (!prefersReducedMotion) {
      animateKPIs();
      animateInsights();
    }
  }

  /* ========== RENDER ALL ========== */
  function renderAll() {
    var emps = D.getFilteredEmployees(activeFilters);
    renderKPIs(emps);
    renderTable(emps);
    renderActiveChips();
    var activeTab = document.querySelector(".tab-btn.active").dataset.tab;
    destroyAllCharts();
    if (activeTab === "overview") {
      renderOverviewCharts(emps);
    } else {
      renderTrendsCharts(emps);
      renderDeptSummary(emps);
    }
  }

  /* ========== KPIs ========== */
  function renderKPIs(emps) {
    var dist = D.computeGenderDistribution(emps);
    var avg = D.computeAvgSalary(emps);
    var gap = D.computePayGap(emps);
    var salaries = emps.map(function (e) { return e.salary; });
    var minS = salaries.length ? Math.min.apply(null, salaries) : 0;
    var maxS = salaries.length ? Math.max.apply(null, salaries) : 0;

    document.getElementById("kpi-gender-split").textContent = dist.femalePct + "% / " + dist.malePct + "%";
    document.getElementById("kpi-avg-salary").textContent = formatNum(avg) + " SEK";
    document.getElementById("kpi-salary-range").innerHTML = Math.round(minS / 1000) + "k&ndash;" + Math.round(maxS / 1000) + "k";
    document.getElementById("kpi-pay-gap").textContent = gap + "%";

    var badge = document.getElementById("kpi-gap-badge");
    if (gap <= 5) {
      badge.textContent = "Compliant";
      badge.className = "kpi-badge compliant";
    } else {
      badge.textContent = "Needs review";
      badge.className = "kpi-badge warning";
    }

    document.getElementById("table-count").textContent = emps.length + " employees";
  }

  /* ========== OVERVIEW CHARTS ========== */
  function renderOverviewCharts(emps) {
    renderGenderDonut(emps);
    renderSalaryDonut(emps);
    renderGapTrend();
    renderScatter(emps);
    renderAvgSalaryBars();
    renderMedianDeptBars(emps, "chart-median-dept");
  }

  function renderGenderDonut(emps) {
    var dist = D.computeGenderDistribution(emps);
    charts.genderDonut = new Chart(document.getElementById("chart-gender-donut"), {
      type: "doughnut",
      data: {
        labels: ["Women", "Men"],
        datasets: [{
          data: [dist.female, dist.male],
          backgroundColor: ["#6C5CE7", "#00B894"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: { legend: { display: false }, tooltip: { enabled: true } }
      }
    });
  }

  function renderSalaryDonut(emps) {
    var ranges = D.computeSalaryDistribution(emps);
    var colors = ["#6C5CE7", "#A29BFE", "#00B894", "#FDCB6E", "#E17055"];
    charts.salaryDonut = new Chart(document.getElementById("chart-salary-donut"), {
      type: "doughnut",
      data: {
        labels: ranges.map(function (r) { return r.label; }),
        datasets: [{
          data: ranges.map(function (r) { return r.count; }),
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: { legend: { display: false }, tooltip: { enabled: true } }
      }
    });
  }

  function renderGapTrend() {
    var trend = D.getPayGapTrend();
    charts.gapTrend = new Chart(document.getElementById("chart-gap-trend"), {
      type: "line",
      data: {
        labels: trend.years,
        datasets: [
          { label: "Sweden avg", data: trend.sweden, borderColor: "#6C5CE7", backgroundColor: "rgba(108,92,231,0.08)", fill: true, tension: 0.3, pointRadius: 4, pointHoverRadius: 6 },
          { label: "Stockholm", data: trend.stockholm, borderColor: "#00B894", backgroundColor: "transparent", fill: false, tension: 0.3, pointRadius: 4, pointHoverRadius: 6 },
          { label: "Gothenburg", data: trend.gothenburg, borderColor: "#FD79A8", backgroundColor: "transparent", fill: false, tension: 0.3, pointRadius: 4, pointHoverRadius: 6 }
        ]
      },
      options: chartLineOpts("% gap")
    });
  }

  function renderScatter(emps) {
    var femaleData = [], maleData = [];
    emps.forEach(function (e) {
      var pt = { x: e.age, y: e.salary };
      if (e.gender === "Female") femaleData.push(pt); else maleData.push(pt);
    });
    charts.scatter = new Chart(document.getElementById("chart-scatter"), {
      type: "scatter",
      data: {
        datasets: [
          { label: "Women", data: femaleData, backgroundColor: "rgba(108,92,231,0.7)", pointRadius: 6, pointHoverRadius: 8 },
          { label: "Men", data: maleData, backgroundColor: "rgba(0,184,148,0.7)", pointRadius: 6, pointHoverRadius: 8 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Age" }, grid: { color: "rgba(0,0,0,0.04)" } },
          y: { title: { display: true, text: "Salary (SEK)" }, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { callback: function (v) { return formatNum(v); } } }
        },
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true, padding: 16 } },
          tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ": " + formatNum(ctx.parsed.y) + " SEK, age " + ctx.parsed.x; } } }
        }
      }
    });
  }

  function renderAvgSalaryBars() {
    var data = D.getAvgSalaryByYear();
    charts.avgSalary = new Chart(document.getElementById("chart-avg-salary"), {
      type: "bar",
      data: {
        labels: data.years,
        datasets: [
          { label: "Women", data: data.female, backgroundColor: "#6C5CE7", borderRadius: 4, barPercentage: 0.6, categoryPercentage: 0.7 },
          { label: "Men", data: data.male, backgroundColor: "#00B894", borderRadius: 4, barPercentage: 0.6, categoryPercentage: 0.7 }
        ]
      },
      options: chartBarOpts("SEK")
    });
  }

  function renderMedianDeptBars(emps, canvasId) {
    var data = D.computeDepartmentMedians(emps);
    charts[canvasId] = new Chart(document.getElementById(canvasId), {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          { label: "Women", data: data.female, backgroundColor: "#6C5CE7", borderRadius: 4, barPercentage: 0.6, categoryPercentage: 0.7 },
          { label: "Men", data: data.male, backgroundColor: "#00B894", borderRadius: 4, barPercentage: 0.6, categoryPercentage: 0.7 }
        ]
      },
      options: chartBarOpts("SEK")
    });
  }

  /* ========== TRENDS CHARTS ========== */
  function renderTrendsCharts(emps) {
    renderDeptGapTrend();
    renderHeadcount();
    renderMedianDeptBars(emps, "chart-trends-median");
  }

  function renderDeptGapTrend() {
    var data = D.getDepartmentTrends();
    var colors = ["#6C5CE7", "#00B894", "#FD79A8", "#FDCB6E", "#E17055", "#A29BFE"];
    var datasets = D.departments.map(function (dept, i) {
      return {
        label: dept,
        data: data[dept],
        borderColor: colors[i],
        backgroundColor: "transparent",
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2
      };
    });
    charts.deptGapTrend = new Chart(document.getElementById("chart-dept-gap-trend"), {
      type: "line",
      data: { labels: data.years, datasets: datasets },
      options: chartLineOpts("% gap")
    });
  }

  function renderHeadcount() {
    var data = D.getHeadcountTrend();
    charts.headcount = new Chart(document.getElementById("chart-headcount"), {
      type: "line",
      data: {
        labels: data.years,
        datasets: [
          { label: "Women", data: data.female, borderColor: "#6C5CE7", backgroundColor: "rgba(108,92,231,0.15)", fill: true, tension: 0.3, pointRadius: 3 },
          { label: "Men", data: data.male, borderColor: "#00B894", backgroundColor: "rgba(0,184,148,0.15)", fill: true, tension: 0.3, pointRadius: 3 }
        ]
      },
      options: chartLineOpts("headcount")
    });
  }

  function renderDeptSummary(emps) {
    var gaps = D.computeDepartmentGaps(emps);
    var trends = D.getDepartmentTrends();
    var tbody = document.getElementById("dept-summary-body");
    tbody.innerHTML = "";
    D.departments.forEach(function (dept) {
      var g = gaps[dept];
      var trendData = trends[dept];
      var trendDir = trendData[trendData.length - 1] < trendData[0] ? "Improving" : "Stable";
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + dept + "</td>" +
        "<td>" + g.count + "</td>" +
        "<td>" + formatNum(g.avgFemale) + " SEK</td>" +
        "<td>" + formatNum(g.avgMale) + " SEK</td>" +
        "<td>" + g.gap + "%</td>" +
        '<td style="color:' + (trendDir === "Improving" ? "#00B894" : "#636E72") + '">' + trendDir + "</td>";
      tbody.appendChild(tr);
    });
  }

  /* ========== CHART OPTION HELPERS ========== */
  function chartLineOpts(yLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: "rgba(0,0,0,0.04)" } },
        y: { title: { display: true, text: yLabel }, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { callback: function (v) { return yLabel === "% gap" ? v + "%" : v; } } }
      },
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, padding: 16 } },
        tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ": " + ctx.parsed.y + (yLabel === "% gap" ? "%" : ""); } } }
      }
    };
  }

  function chartBarOpts(yLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { callback: function (v) { return formatNum(v); } } }
      },
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, padding: 16 } },
        tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ": " + formatNum(ctx.parsed.y) + " " + yLabel; } } }
      }
    };
  }

  function destroyAllCharts() {
    Object.keys(charts).forEach(function (key) {
      if (charts[key]) { charts[key].destroy(); charts[key] = null; }
    });
    charts = {};
  }

  /* ========== TABLE ========== */
  function renderTable(emps) {
    var sorted = emps.slice();
    if (sortState.col) {
      sorted.sort(function (a, b) {
        var va = a[sortState.col], vb = b[sortState.col];
        if (typeof va === "string") va = va.toLowerCase();
        if (typeof vb === "string") vb = vb.toLowerCase();
        if (va < vb) return sortState.dir === "asc" ? -1 : 1;
        if (va > vb) return sortState.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    var tbody = document.getElementById("table-body");
    tbody.innerHTML = "";
    sorted.forEach(function (e) {
      var tr = document.createElement("tr");
      var genderClass = e.gender === "Female" ? "gender-female" : "gender-male";
      tr.innerHTML =
        "<td>" + e.name + "</td>" +
        "<td>" + e.department + "</td>" +
        "<td>" + e.location + "</td>" +
        '<td class="' + genderClass + '">' + e.gender + "</td>" +
        "<td>" + e.age + "</td>" +
        "<td>" + formatNum(e.salary) + "</td>" +
        "<td>" + e.startDate + "</td>";
      tbody.appendChild(tr);
    });
  }

  function bindTableSort() {
    var headers = document.querySelectorAll("#employee-table thead th");
    headers.forEach(function (th) {
      th.addEventListener("click", function () {
        var col = th.dataset.col;
        if (sortState.col === col) {
          sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
        } else {
          sortState.col = col;
          sortState.dir = "asc";
        }
        headers.forEach(function (h) {
          h.classList.remove("sorted");
          h.querySelector(".sort-indicator").textContent = "";
        });
        th.classList.add("sorted");
        th.querySelector(".sort-indicator").textContent = sortState.dir === "asc" ? " \u25B2" : " \u25BC";
        renderAll();
      });
    });
  }

  /* ========== TABS ========== */
  function bindTabs() {
    document.querySelectorAll(".tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        document.querySelectorAll(".tab-content").forEach(function (c) { c.classList.remove("active"); });
        document.getElementById(btn.dataset.tab + "-tab").classList.add("active");
        renderAll();
      });
    });
  }

  /* ========== BANNER ========== */
  function bindBanner() {
    document.getElementById("banner-close").addEventListener("click", function () {
      document.getElementById("portfolio-banner").classList.add("hidden");
    });
  }

  /* ========== DATE PICKER ========== */
  function bindDatePicker() {
    var picker = document.getElementById("date-picker");
    var dropdown = document.getElementById("date-dropdown");

    picker.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });

    dropdown.querySelectorAll(".date-dropdown-item").forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.querySelectorAll(".date-dropdown-item").forEach(function (i) { i.classList.remove("selected"); });
        item.classList.add("selected");
        document.getElementById("date-display").textContent = item.dataset.range;
        dropdown.classList.remove("open");
      });
    });
  }

  /* ========== TOOLBAR DROPDOWNS ========== */
  function buildFilterDropdowns() {
    var deptDD = document.getElementById("dept-dropdown");
    D.departments.forEach(function (dept) {
      var label = document.createElement("label");
      label.innerHTML = '<input type="checkbox" data-dept="' + dept + '"> ' + dept;
      deptDD.appendChild(label);
    });

    var locDD = document.getElementById("loc-dropdown");
    D.locations.forEach(function (loc) {
      var label = document.createElement("label");
      label.innerHTML = '<input type="checkbox" data-loc="' + loc + '"> ' + loc;
      locDD.appendChild(label);
    });

    // Panel filters
    var panelDept = document.getElementById("panel-dept-filters");
    D.departments.forEach(function (dept) {
      var label = document.createElement("label");
      label.innerHTML = '<input type="checkbox" data-panel-dept="' + dept + '"> ' + dept;
      panelDept.appendChild(label);
    });

    var panelLoc = document.getElementById("panel-loc-filters");
    D.locations.forEach(function (loc) {
      var label = document.createElement("label");
      label.innerHTML = '<input type="checkbox" data-panel-loc="' + loc + '"> ' + loc;
      panelLoc.appendChild(label);
    });
  }

  function bindToolbarDropdowns() {
    var deptBtn = document.getElementById("dept-filter-btn");
    var deptDD = document.getElementById("dept-dropdown");
    var locBtn = document.getElementById("loc-filter-btn");
    var locDD = document.getElementById("loc-dropdown");

    deptBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      locDD.classList.remove("open");
      deptDD.classList.toggle("open");
    });

    locBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      deptDD.classList.remove("open");
      locDD.classList.toggle("open");
    });

    deptDD.addEventListener("click", function (e) { e.stopPropagation(); });
    locDD.addEventListener("click", function (e) { e.stopPropagation(); });

    deptDD.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        syncDropdownFilters("dept");
        renderAll();
      });
    });

    locDD.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        syncDropdownFilters("loc");
        renderAll();
      });
    });

    document.addEventListener("click", function () {
      deptDD.classList.remove("open");
      locDD.classList.remove("open");
      document.getElementById("date-dropdown").classList.remove("open");
    });
  }

  function syncDropdownFilters(type) {
    if (type === "dept") {
      activeFilters.departments = [];
      document.querySelectorAll('#dept-dropdown input[type="checkbox"]:checked').forEach(function (cb) {
        activeFilters.departments.push(cb.dataset.dept);
      });
      var btn = document.getElementById("dept-filter-btn");
      btn.classList.toggle("has-active", activeFilters.departments.length > 0);
      // Sync panel
      document.querySelectorAll('[data-panel-dept]').forEach(function (cb) {
        cb.checked = activeFilters.departments.indexOf(cb.dataset.panelDept) !== -1;
      });
    } else {
      activeFilters.locations = [];
      document.querySelectorAll('#loc-dropdown input[type="checkbox"]:checked').forEach(function (cb) {
        activeFilters.locations.push(cb.dataset.loc);
      });
      var btn2 = document.getElementById("loc-filter-btn");
      btn2.classList.toggle("has-active", activeFilters.locations.length > 0);
      // Sync panel
      document.querySelectorAll('[data-panel-loc]').forEach(function (cb) {
        cb.checked = activeFilters.locations.indexOf(cb.dataset.panelLoc) !== -1;
      });
    }
  }

  /* ========== ACTIVE FILTER CHIPS ========== */
  function renderActiveChips() {
    var container = document.getElementById("active-filters");
    // Remove existing chips
    container.querySelectorAll(".filter-chip").forEach(function (c) { c.remove(); });

    var all = activeFilters.departments.concat(activeFilters.locations);
    if (all.length === 0) {
      container.classList.add("hidden");
      return;
    }
    container.classList.remove("hidden");

    activeFilters.departments.forEach(function (d) {
      container.appendChild(createChip(d, "dept"));
    });
    activeFilters.locations.forEach(function (l) {
      container.appendChild(createChip(l, "loc"));
    });
  }

  function createChip(label, type) {
    var chip = document.createElement("span");
    chip.className = "filter-chip";
    chip.innerHTML = label + ' <button class="filter-chip-remove" aria-label="Remove ' + label + '">&times;</button>';
    chip.querySelector(".filter-chip-remove").addEventListener("click", function () {
      if (type === "dept") {
        activeFilters.departments = activeFilters.departments.filter(function (d) { return d !== label; });
        var cb = document.querySelector('#dept-dropdown input[data-dept="' + label + '"]');
        if (cb) cb.checked = false;
        document.getElementById("dept-filter-btn").classList.toggle("has-active", activeFilters.departments.length > 0);
      } else {
        activeFilters.locations = activeFilters.locations.filter(function (l) { return l !== label; });
        var cb2 = document.querySelector('#loc-dropdown input[data-loc="' + label + '"]');
        if (cb2) cb2.checked = false;
        document.getElementById("loc-filter-btn").classList.toggle("has-active", activeFilters.locations.length > 0);
      }
      // Sync panel
      document.querySelectorAll('[data-panel-dept]').forEach(function (c) {
        c.checked = activeFilters.departments.indexOf(c.dataset.panelDept) !== -1;
      });
      document.querySelectorAll('[data-panel-loc]').forEach(function (c) {
        c.checked = activeFilters.locations.indexOf(c.dataset.panelLoc) !== -1;
      });
      renderAll();
    });
    return chip;
  }

  /* ========== FILTER PANEL ========== */
  function bindFilterPanel() {
    var overlay = document.getElementById("filter-overlay");
    var panel = document.getElementById("filter-panel");

    document.getElementById("open-filter-panel-btn").addEventListener("click", function () {
      overlay.classList.add("open");
      panel.classList.add("open");
    });

    function closePanel() {
      overlay.classList.remove("open");
      panel.classList.remove("open");
    }

    document.getElementById("filter-panel-close").addEventListener("click", closePanel);
    overlay.addEventListener("click", closePanel);

    document.getElementById("filter-apply-btn").addEventListener("click", function () {
      activeFilters.departments = [];
      document.querySelectorAll('[data-panel-dept]:checked').forEach(function (cb) {
        activeFilters.departments.push(cb.dataset.panelDept);
      });
      activeFilters.locations = [];
      document.querySelectorAll('[data-panel-loc]:checked').forEach(function (cb) {
        activeFilters.locations.push(cb.dataset.panelLoc);
      });
      // Sync toolbar dropdowns
      document.querySelectorAll('#dept-dropdown input[type="checkbox"]').forEach(function (cb) {
        cb.checked = activeFilters.departments.indexOf(cb.dataset.dept) !== -1;
      });
      document.querySelectorAll('#loc-dropdown input[type="checkbox"]').forEach(function (cb) {
        cb.checked = activeFilters.locations.indexOf(cb.dataset.loc) !== -1;
      });
      document.getElementById("dept-filter-btn").classList.toggle("has-active", activeFilters.departments.length > 0);
      document.getElementById("loc-filter-btn").classList.toggle("has-active", activeFilters.locations.length > 0);
      closePanel();
      renderAll();
    });

    document.getElementById("filter-reset-btn").addEventListener("click", function () {
      document.querySelectorAll('[data-panel-dept], [data-panel-loc]').forEach(function (cb) { cb.checked = false; });
      activeFilters.departments = [];
      activeFilters.locations = [];
      document.querySelectorAll('#dept-dropdown input[type="checkbox"], #loc-dropdown input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
      document.getElementById("dept-filter-btn").classList.remove("has-active");
      document.getElementById("loc-filter-btn").classList.remove("has-active");
      closePanel();
      renderAll();
    });
  }

  /* ========== DOWNLOAD ========== */
  function bindDownload() {
    document.getElementById("download-btn").addEventListener("click", function () {
      showToast("Report downloaded successfully");
    });
  }

  /* ========== TOAST ========== */
  function showToast(message) {
    var container = document.getElementById("toast-container");
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = '<span class="toast-icon">&#10003;</span>' + message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("toast-out");
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  /* ========== KPI COUNT-UP ========== */
  function animateKPIs() {
    animateValue("kpi-avg-salary", 0, D.computeAvgSalary(), 1200, function (v) { return formatNum(v) + " SEK"; });
    animateValue("kpi-pay-gap", 0, D.computePayGap(), 1200, function (v) { return v.toFixed(1) + "%"; });
  }

  function animateValue(elementId, start, end, duration, formatter) {
    var el = document.getElementById(elementId);
    if (!el) return;
    var startTime = null;
    var isFloat = end % 1 !== 0;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = start + (end - start) * eased;
      if (!isFloat) current = Math.round(current);
      el.textContent = formatter(current);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ========== INSIGHT TYPING ========== */
  function animateInsights() {
    var items = document.querySelectorAll("#insight-list li");
    items.forEach(function (li, i) {
      var text = li.textContent;
      li.textContent = "";
      li.style.visibility = "visible";
      setTimeout(function () { typeText(li, text, 0); }, i * 600);
    });
  }

  function typeText(el, text, idx) {
    if (idx <= text.length) {
      el.textContent = text.substring(0, idx);
      setTimeout(function () { typeText(el, text, idx + 1); }, 18);
    }
  }

  /* ========== UTILITIES ========== */
  function formatNum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* ========== START ========== */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
