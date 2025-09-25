// Dashboard specific functions and chart initialization
// dashboard.js

function observeDashboardVisibility() {
    const dashboard = document.getElementById('dashboard-content');

    if (!dashboard) {
        console.warn("Dashboard element not found.");
        return;
    }

    // Initial check after load
    if (dashboard.classList.contains('active')) {
        initDashboardCharts();
    }

    // Observe class changes to detect tab/page switch
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (
                mutation.type === 'attributes' &&
                mutation.attributeName === 'class'
            ) {
                const isActive = dashboard.classList.contains('active');
                if (isActive) {
                    console.log("Dashboard became active – initializing charts.");
                    initDashboardCharts();
                }
            }
        }
    });

    observer.observe(dashboard, { attributes: true });
}

function initDashboardCharts() {
    console.log("Initializing dashboard charts...");

    const dashboard = document.getElementById('dashboard-content');
    if (!dashboard || !dashboard.classList.contains('active')) {
        console.log("Dashboard not active, skipping chart initialization");
        return;
    }

    const uiuxData = [5, 3, 2];
    const softwareData = [8, 4, 3];
    const artistData = [6, 2, 4];

    const chartConfigs = [
        {
            id: 'uiuxChart',
            labels: ['Completed Projects', 'Ongoing Projects', 'Pending Projects'],
            data: uiuxData,
            colors: ['#4CAF50', '#FFC107', '#F44336']
        },
        {
            id: 'softwareChart',
            labels: ['Completed Projects', 'Ongoing Projects', 'Pending Projects'],
            data: softwareData,
            colors: ['#2196F3', '#FF9800', '#9C27B0']
        },
        {
            id: 'artistChart',
            labels: ['Completed Projects', 'Ongoing Projects', 'Pending Projects'],
            data: artistData,
            colors: ['#00BCD4', '#8BC34A', '#E91E63']
        }
    ];

    chartConfigs.forEach(config => {
        const canvas = document.getElementById(config.id);
        if (!canvas) {
            console.warn(`Canvas element '${config.id}' not found`);
            return;
        }

        // Retry logic with attempt limit
        const tryCreateChart = (attempt = 0) => {
            const rect = canvas.getBoundingClientRect();
            if ((rect.width === 0 || rect.height === 0) && attempt < 10) {
                console.warn(`Canvas '${config.id}' has zero dimensions. Retrying in 200ms... (Attempt ${attempt + 1})`);
                setTimeout(() => tryCreateChart(attempt + 1), 200);
            } else if (attempt >= 10) {
                console.error(`Canvas '${config.id}' still has zero size after 10 attempts. Skipping chart.`);
            } else {
                createSingleChart(config);
            }
        };

        tryCreateChart();
    });
}


function createSingleChart(config) {
    const canvas = document.getElementById(config.id);

    try {
        if (typeof Chart === 'undefined') {
            console.error("Chart.js is not loaded yet.");
            return;
        }

        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const chart = createPieChart(canvas, config.labels, config.data, config.colors);
        console.log(`Created chart for ${config.id}`);

        return chart;
    } catch (error) {
        console.error(`Failed to create chart for ${config.id}:`, error);
    }
}


// Random quote display
function showRandomQuote() {
    const randomQuoteElement = document.getElementById('randomQuote');
    if (!randomQuoteElement) return;

    const allQuotes = [...quotes, ...defaultQuotes];
    
    if (allQuotes.length > 0) {
        const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
        randomQuoteElement.innerHTML = `
            <p>"${randomQuote.text}"</p>
            <div class="quote-author">- ${randomQuote.author}</div>
        `;
    }
}


// Make functions globally available
window.initDashboardCharts = initDashboardCharts;
window.showRandomQuote = showRandomQuote;
window.observeDashboardVisibility = observeDashboardVisibility;

// 1. Add proper CSS dimensions to chart containers
const chartCSS = `
.chart-card {
    background: #fff;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    min-height: 300px; /* Ensure minimum height */
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.chart-card canvas {
    max-width: 220px !important;
    max-height: 220px !important;
    width: 220px !important;
    height: 220px !important;
    margin: 0 auto;
    display: block;
}
`;

// 2. Improved chart initialization function
// function initializeCharts() {
//     // Wait for DOM to be fully loaded
//     if (document.readyState !== 'complete') {
//         document.addEventListener('DOMContentLoaded', initializeCharts);
//         return;
//     }

//     // Check if containers are visible and have dimensions
//     const chartContainers = ['uiuxChart', 'softwareChart', 'artistChart'];
    
//     chartContainers.forEach(chartId => {
//         const canvas = document.getElementById(chartId);
//         if (!canvas) {
//             console.warn(`Chart canvas ${chartId} not found`);
//             return;
//         }

//         const container = canvas.parentElement;
        
//         // Ensure container is visible
//         if (container.offsetWidth === 0 || container.offsetHeight === 0) {
//             console.warn(`Chart container ${chartId} has zero dimensions, delaying initialization`);
            
//             // Retry after a short delay
//             setTimeout(() => {
//                 initializeChart(chartId);
//             }, 500);
//             return;
//         }

//         // Initialize chart immediately if container has dimensions
//         initializeChart(chartId);
//     });
// }

// 3. Safe chart initialization function
// function initializeChart(chartId) {
//     const canvas = document.getElementById(chartId);
//     if (!canvas) return;

//     // Destroy existing chart if it exists
//     if (canvas.chart) {
//         canvas.chart.destroy();
//     }

//     // Set explicit canvas dimensions
//     canvas.width = 220;
//     canvas.height = 220;
//     canvas.style.width = '220px';
//     canvas.style.height = '220px';

//     try {
//         const ctx = canvas.getContext('2d');
        
//         // Chart data based on chart type
//         let chartData, chartConfig;
        
//         switch(chartId) {
//             case 'uiuxChart':
//                 chartData = {
//                     labels: ['Completed', 'In Progress', 'Pending'],
//                     datasets: [{
//                         data: [60, 30, 10],
//                         backgroundColor: ['#4ecdc4', '#ffd93d', '#ff6b6b'],
//                         borderWidth: 2,
//                         borderColor: '#ffffff'
//                     }]
//                 };
//                 break;
//             case 'softwareChart':
//                 chartData = {
//                     labels: ['Completed', 'In Progress', 'Testing'],
//                     datasets: [{
//                         data: [45, 35, 20],
//                         backgroundColor: ['#4ecdc4', '#ffd93d', '#a8e6cf'],
//                         borderWidth: 2,
//                         borderColor: '#ffffff'
//                     }]
//                 };
//                 break;
//             case 'artistChart':
//                 chartData = {
//                     labels: ['Completed', 'In Progress', 'Review'],
//                     datasets: [{
//                         data: [70, 20, 10],
//                         backgroundColor: ['#4ecdc4', '#ffd93d', '#ffb4ac'],
//                         borderWidth: 2,
//                         borderColor: '#ffffff'
//                     }]
//                 };
//                 break;
//             default:
//                 console.warn(`Unknown chart type: ${chartId}`);
//                 return;
//         }

//         chartConfig = {
//             type: 'doughnut',
//             data: chartData,
//             options: {
//                 responsive: false, // Important: disable responsive to prevent resize issues
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: {
//                         position: 'bottom',
//                         labels: {
//                             padding: 20,
//                             usePointStyle: true,
//                             font: {
//                                 size: 12
//                             }
//                         }
//                     }
//                 },
//                 elements: {
//                     arc: {
//                         borderWidth: 2
//                     }
//                 }
//             }
//         };

//         // Create chart with error handling
//         canvas.chart = new Chart(ctx, chartConfig);
        
//         console.log(`Chart ${chartId} initialized successfully`);
        
//     } catch (error) {
//         console.error(`Error initializing chart ${chartId}:`, error);
//     }
// }

// 4. Initialize charts when dashboard content is shown
// function initializeChartsOnContentShow() {
//     // Observer to detect when dashboard content becomes visible
//     const dashboardContent = document.getElementById('dashboard-content');
//     if (!dashboardContent) return;

//     const observer = new MutationObserver((mutations) => {
//         mutations.forEach((mutation) => {
//             if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
//                 if (dashboardContent.classList.contains('active')) {
//                     // Dashboard is now visible, initialize charts
//                     setTimeout(() => {
//                         initializeCharts();
//                     }, 100);
//                 }
//             }
//         });
//     });

//     observer.observe(dashboardContent, { attributes: true });
// }

// 5. Enhanced initialization with multiple fallbacks
// document.addEventListener('DOMContentLoaded', function() {
//     // Add chart CSS
//     const styleSheet = document.createElement('style');
//     styleSheet.textContent = chartCSS;
//     document.head.appendChild(styleSheet);
    
//     // Initialize immediately if dashboard is visible
//     setTimeout(() => {
//         const dashboardContent = document.getElementById('dashboard-content');
//         if (dashboardContent && dashboardContent.classList.contains('active')) {
//             initializeCharts();
//         }
//     }, 500);
    
    // Set up observer for content visibility changes
//     initializeChartsOnContentShow();
    
//     // Fallback: Re-initialize when window is resized (but only if charts exist)
//     let resizeTimeout;
//     window.addEventListener('resize', function() {
//         clearTimeout(resizeTimeout);
//         resizeTimeout = setTimeout(() => {
//             const charts = ['uiuxChart', 'softwareChart', 'artistChart'];
//             charts.forEach(chartId => {
//                 const canvas = document.getElementById(chartId);
//                 if (canvas && canvas.chart && canvas.offsetParent !== null) {
//                     // Chart exists and is visible, reinitialize
//                     initializeChart(chartId);
//                 }
//             });
//         }, 250);
//     });
// });

// 6. Safe chart destruction function for cleanup
// function destroyCharts() {
//     const chartIds = ['uiuxChart', 'softwareChart', 'artistChart'];
//     chartIds.forEach(chartId => {
//         const canvas = document.getElementById(chartId);
//         if (canvas && canvas.chart) {
//             canvas.chart.destroy();
//             canvas.chart = null;
//         }
//     });
// }

function activateSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Optional: trigger specific logic for dashboard
    if (sectionId === 'dashboard-content') {
        initDashboardCharts?.(); // optional chaining
    }
}

document.addEventListener('DOMContentLoaded', () => {
  activateSection('dashboard-content'); // ✅ show dashboard
  observeDashboardVisibility();         // ✅ observe visibility and init charts only when visible
});


