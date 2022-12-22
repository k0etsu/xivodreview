<template>
  <div class="fflogs">
    <p>Parsed report ID: {{ reportId }}</p>
  </div>
</template>

<style>
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
</style>

<script lang="ts">
export default {
  data() {
    return {
      report_url: '',
      reportId: ''
    }
  },
  watch: {
    report_url: function (newValue, oldValue) {
      this.getReportId(newValue)
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
        //this.$router.push('/report?reportId=' + report[reportIndex + 1]);
        this.window.href = '/report?reportId=' + report[reportIndex + 1];
      } catch (error) {
        this.reportId = 'Please enter a valid FFLogs report URL';
      }
    }
  }
}
</script>
