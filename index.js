const express = require("express")
const app = express()
const NIFTY50_SYMBOL = 'NIFTY 50'
const NIFTYSMALLCAP250_SYMBOL = 'NIFTY SMLCAP 250'
const smallcapInitialTRI = 2100.00
const niftyInitialTRI = 4807.77
const requestUrl = "https://www.niftyindices.com/Backpage.aspx/getTotalReturnIndexString"
const requestHeaders = {
  'Content-type': 'application/json; charset=UTF-8',
  'Accept-Language': 'en-GB',
  'Accept': '*/*'
}

app.use(express.static("public"));

const port = 3000;
app.listen(process.env.port || port, function () {
    console.log(`Server running on http://localhost:${port}`)
})

app.get("/", function (request, response) {
  console.log(`Server listening on port ${port}`)
  response.sendFile(__dirname + "/index.html")
})

function getTodayAsString() {
  let today = new Date()
  let options = { day: '2-digit', month: 'short', year: 'numeric' }
  return today.toLocaleDateString('en-GB', options).replace(/ /g, '-')
}

async function fetchDataAsync(url, headers, body) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.log('Error:', error)
  }
}

const startDate = '03-Apr-2023'

app.get("/tri", async function (req, res) {
  const NIFTY50_REQ_BODY = {
    'name': NIFTY50_SYMBOL,
    'startDate': startDate,
    'endDate': '03-Apr-2023'
  }

  const NIFTYSMALLCAP250_REQ_BODY = {
    'name': NIFTYSMALLCAP250_SYMBOL,
    'startDate': startDate,
    'endDate': '03-Apr-2023'
  }

  const json1 = await fetchDataAsync(requestUrl, requestHeaders, NIFTY50_REQ_BODY);
  const json2 = await fetchDataAsync(requestUrl, requestHeaders, NIFTYSMALLCAP250_REQ_BODY);
  parseData(json1.d, json2.d)
  res.send('Finished parsing data')
})

function parseData(niftyData, smallcapData) {
  const linebreak = "=".repeat(50);
  console.log(linebreak)
  console.log("Start parsing data:")
  console.log(linebreak)

  const niftyValues = JSON.parse(niftyData)
  const smallcapValues = JSON.parse(smallcapData)
  console.log("nifty values length: " + niftyValues.length)
  console.log("smallcap values length: " + smallcapValues.length)

  for(const smallcapObj of smallcapValues) {
    const smallcapDate = smallcapObj.Date
    const smallcapTRI = parseFloat(smallcapObj.TotalReturnsIndex)
    let niftyTRI = 0

    for (const niftyObj of niftyValues) {
      const niftyDate = niftyObj.Date

      if (niftyDate === smallcapDate) {
        niftyTRI = parseFloat(niftyObj.TotalReturnsIndex)
        break
      }
    }

    if (smallcapTRI && niftyTRI) {
      const relativeValue = ((smallcapTRI / smallcapInitialTRI) / (niftyTRI / niftyInitialTRI))
      console.log("date: " + smallcapDate + " relative value: " + relativeValue)
    }
  }

  console.log(linebreak)
  console.log("Finished parsing data:")
  console.log(linebreak)
}

module.exports = app
