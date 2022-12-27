export default function Form() {
  const getFflogsReport = async event => {
    event.preventDefault() // don't redirect the page

    console.log(event.target.fflogsUrl.value)
    var reportId = new URL(event.target.fflogsUrl.value).pathname.split('/').slice(-1);
    console.log(new URL(event.target.fflogsUrl.value).pathname)
    console.log(reportId)

    var url = 'http://api.yamanote.co/fflogs?';
    console.log(url + new URLSearchParams({ reportId: reportId }).toString())

    const res = await fetch(
      url + new URLSearchParams({ reportId: reportId}).toString(),
      {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      }
    )

    const result = await res.json()
    console.log(result)
  }

  return (
    <form onSubmit={getFflogsReport}>
      <label htmlFor="fflogsUrl">FFLogs report URL{' '}</label>
      <input id="fflogsUrl" name="fflogsUrl" type="text" required />
      <button type="submit">Analyze</button>
    </form>
  )
}
