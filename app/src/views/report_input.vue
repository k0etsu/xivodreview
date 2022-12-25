<template>
  <div class="fflogs">
    <input class="fflogs-input" v-model.lazy.trim="report_url" placeholder="FFLogs report URL" />
    <!-- <button @click="ceciliabutton">Hello I am a button</button> -->
  </div>
</template>

<!-- <style>
@media (min-width: 1024px) {
  .fflogs {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
  }
  .fflogs-input {
    min-width: 25vh;
  }
}
</style> -->

<script lang="ts">
export default {
  data() {
    return {
      report_url: '',
      reportId: '',
      fflogs_data: ''
    }
  },
  watch: {
    report_url: function (newValue, oldValue) {
      var reportId = this.getReportId(newValue)
      var reportData = this.getReportData(this.reportId)
    }
  },
  methods: {
    async getReportId(reportUrl: string) {
      try {
        const url = new URL(reportUrl)
        var report = url.pathname.split('/')
        var reportIndex = report.indexOf('reports')
        console.log(report[reportIndex + 1])
        console.log('/report?reportId=' + report[reportIndex + 1])
        this.reportId = report[reportIndex + 1]
        // this.$router.push('/report?reportId=' + report[reportIndex + 1]);
        //this.window.href = '/report?reportId=' + report[reportIndex + 1];
      } catch (error) {
        this.reportId = 'Please enter a valid FFLogs report URL';
      }
    },
    getReportData(reportId: string) {
      console.log("Ryan says nice");
      fetch("https://api.yamanote.co/fflogs?reportId=" + reportId)
        .then(async response => {
          const reportData = await response.json();
          console.log(reportData);
          return reportData;
        })
        .catch(error => {
          console.error("there was an error: ", error);
        })
    }
  }
}
</script>
