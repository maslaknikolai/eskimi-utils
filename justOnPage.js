function sleep (ms) {
    return new Promise(r => setTimeout(r, ms))
}

async function getCoordinates(address) {
    const searchField = document.querySelector('#query-input')
    const searchBtn = document.querySelector('#geocode-button')

    searchField.value = address
    searchBtn.click()
    await sleep(1500)

    const resultLocation = document.querySelector('#results-display-div .result-location')

    const coords = resultLocation?.innerText.split(': ')[1]

    return coords
}

async function meh(addressesString) {
    window.stoprrr = false
    const addresses = addressesString
        .split('\n')
        .filter(Boolean)
        .map(addressString => ({
            addressString,
            coords: ''
        }))


    let processedCount = 0
    let erroredCount = 0
    for (address of addresses) {

        if (window.stoprrr) {
            break;
        }

        try {
            const coords = await getCoordinates(address.addressString)

            console.log(coords);

            if (!coords) {
                erroredCount += 1
                console.log('Ошибка', address.addressString);
                continue;
            }

            address.coords = coords
        } catch (e){
            console.log('Ошибка', address.addressString);
            console.log(e);
            erroredCount += 1
        }

        processedCount += 1
        console.log(`Обработано: ${processedCount} / ${addresses.length}`, );
        console.log('Ошибки', erroredCount);
    }

    console.log(addresses)
}

document.addEventListener('keydown', (e) => {
    console.log(e);
})