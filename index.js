require('dotenv').config()
const express = require('express')
const puppeteer = require('puppeteer');
const cors = require('cors')
const http = require('http');
const app = express()
const port = process.env.PORT || 3000

app.use(cors())

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

;;(async () => {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV !== 'development',
    'args' : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.goto(`https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/utils/geocoder/embed`, {
    waitUntil: 'networkidle2'
  });

  async function processRequest([req, res]) {
    const query = req.params.query
    await page.$eval('#query-input', (el, query) => {
      el.value = query
    }, query);

    await page.click('#geocode-button')
    await page.waitForSelector('#status-line *')
    const result = await page.evaluate(() => {
      const coords = [...document.querySelectorAll('#results-display-div .result-location')]
        .map(el => el.innerText.split(': ')[1])
      const statusEl = document.querySelector('#status-line')
      const status = statusEl.innerText

      status.innerHTML = '';

      return {
        coords,
        status
      }
    })

    res.send(result)
  }

  const queue = []
  async function processQueue() {
    if (queue.length) {
      await processRequest(queue[0])
      queue.splice(0, 1)
    }
    await sleep(1000)

    processQueue()
  }
  processQueue()

  app.get('/search/:query', async (req, res) => {
    queue.push([req, res])
  })

  app.get('/ping', async (req, res) => {
    res.send('ping')
  })

  app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })

  if (process.env.HEROKU_APP_URL) {
    setInterval(() => {
      http.get(process.env.HEROKU_APP_URL + '/ping');
    }, 10 * 1000)
  }
})();