import { auth, db } from "../js/firebase-config.js";
        import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

        const yearSelect = document.getElementById('yearSelect');
        const myChartCanvas = document.getElementById('myChart');

        let currentUserId = null;
        let myChart = null;

        // Function to populate year dropdown
        function populateYearDropdown() {
            const currentYear = new Date().getFullYear();
            for (let i = currentYear; i >= 2020; i--) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                yearSelect.appendChild(option);
            }
            yearSelect.value = currentYear; // Set current year as default
        }

        // Function to fetch and display data
        async function fetchDataAndDisplay() {
            const selectedYear = parseInt(yearSelect.value);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const labels = monthNames;
            const transactionData = new Array(12).fill(0);
            const budgetData = new Array(12).fill(0);
        
            if (!currentUserId) return;
        
            try {
                // Fetch transactions
                const transactionsCollection = collection(db, "users", currentUserId, "transactions");
                const transactionsSnapshot = await getDocs(transactionsCollection);
        
                transactionsSnapshot.forEach(doc => {
                    const data = doc.data();
                    const transactionDate = data.timestamp?.toDate();
                    if (transactionDate && transactionDate.getFullYear() === selectedYear) {
                        const month = transactionDate.getMonth();
                        transactionData[month] += parseFloat(data.amount) || 0;
                    }
                });
        
                // Fetch budgets
                const budgetsCollection = collection(db, "users", currentUserId, "budgets");
                const budgetsSnapshot = await getDocs(budgetsCollection);
        
                budgetsSnapshot.forEach(doc => {
                    const data = doc.data();
                    //console.log("Budget Data:", data); // Add this line for debugging.
                    if (data.year === selectedYear) {
                        let month = parseInt(data.month);
                        //console.log("Month before adjustment:", month);
                        if (!isNaN(month) && month >= 1 && month <= 12) {
                            budgetData[month - 1] = parseFloat(data.amount) || 0;
                            //console.log("Budget Data Added for Month:", month, "Value:", parseFloat(data.amount) || 0);
                        } else {
                            console.warn("Invalid month in budget data:", data);
                        }
                    }
                });
        
                // Find max value to dynamically adjust Y-axis scale
                const maxValue = Math.max(...transactionData, ...budgetData);
                const suggestedMax = Math.ceil(maxValue / 1000) * 1000;
        
                // Create or update chart
                if (myChart) {
                    myChart.data.datasets[0].data = budgetData;
                    myChart.data.datasets[1].data = transactionData;
                    myChart.options.scales.y.suggestedMax = suggestedMax;
                    myChart.update();
                } else {
                    myChart = new Chart(myChartCanvas, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [
                                {
                                    label: 'Budgets',
                                    data: budgetData,
                                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1
                                },
                                {
                                    label: 'Transactions',
                                    data: transactionData,
                                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1
                                },
                            ]
                        },
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    suggestedMax: suggestedMax,
                                    ticks: {
                                        callback: function (value) {
                                            return 'Rs. ' + value;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
        
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        // Event listener for year selection change
        yearSelect.addEventListener('change', fetchDataAndDisplay);

        // Auth state change listener
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUserId = user.uid;
                populateYearDropdown();
                fetchDataAndDisplay();
            } else {
                currentUserId = null;
                if(myChart){
                    myChart.destroy();
                    myChart = null;
                }
            }
        });