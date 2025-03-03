// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example






fetch('http://localhost:3000/ex') // Replace this with the actual path to your PHP script
    .then(response => response.json())
    .then(data => {
        const playerNames = data.map(item => item.player_name);
        const scores = data.map(item => item.score_avg);

        var ctx = document.getElementById("myPieChart2");
        var myPieChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: playerNames,
            datasets: [{
              data: scores,
              backgroundColor: [
                'rgba(218, 12, 57, 0.76)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(209, 160, 46, 0.8)',
                'rgba(24, 223, 100, 0.9)',
                'rgba(40, 199, 35, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(42, 92, 192, 0.2)'
              ],
              hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
              hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
          },
          options: {
            maintainAspectRatio: false,
            tooltips: {
              backgroundColor: "rgb(255,255,255)",
              bodyFontColor: "#858796",
              borderColor: '#dddfeb',
              borderWidth: 1,
              xPadding: 10,
              yPadding: 10,
              displayColors: false,
              caretPadding: 10,
            },
            legend: {
              display: false
            },
            cutoutPercentage: 80,
          },
        });
    })
    .catch(error => console.error('Error fetching data:', error));



