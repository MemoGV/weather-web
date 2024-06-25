const result = document.querySelector('.result');
const form = document.querySelector('.weather');
const nameCity = document.querySelector('#city');
const nameCountry = document.querySelector('#country');
const prueba = document.querySelector('.prueba')


form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(nameCity.value === '' || nameCountry.value === ''){
        showError('Ambos campos son obligatorios');
        return;
    }

    callAPI(nameCity.value, nameCountry.value);
})

const callAPI=(city, country)=>{
    const apiId = '7fd9ba295d2228d7c60ae6dedc1375f9';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiId}`;
    fetch(url)
        .then(response => response.json())
        .then(dataJSON =>{
            if(dataJSON.cod === '404'){
                showError('Ciudad no encontrada');
            }else{
                clearHTML();
                showWeather(dataJSON);
                console.log(dataJSON);
                const lat = dataJSON.coord.lat;
                const lon = dataJSON.coord.lon;
                const urlDaily =`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiId}`;
                return fetch(urlDaily);
            }
        })
        .then(response => response.json())
        .then(dataDailyJSON =>{
            if(dataDailyJSON){
                showWeatherTime(dataDailyJSON);
                console.log(dataDailyJSON);
            }
        })
        .catch(error =>{
            console.log(error);
        })
}

const showWeatherTime =(data)=>{
    for(let i=0; i<8; i++){
        const arr = data.list[i];
        const {temp} = arr.main;
        const [{main, description, icon}] = arr.weather;
        console.log(`Temp: ${temp}`);
        console.log(main, description, icon)
        const degrees = kelvinToCentigradetemp(temp)
        const content = document.createElement('section');
        content.classList.add =('section-data-weather')
        content.innerHTML = `
            <img src='https://openweathermap.org/img/wn/${icon}@2x.png' alt'Weather Icon'>
            <p>${main}, ${description}</p>
            <h2>${degrees}°C</h2>`
        prueba.appendChild(content);
    }
}

const showWeather=(data)=>{
    const {name, main:{temp,temp_min,temp_max, feels_like, humidity}, weather:[arr], visibility, wind:{speed}, sys:{sunrise, sunset}} = data;
    const degrees = kelvinToCentigradetemp(temp);
    const minDegrees = kelvinToCentigradetemp(temp_min);
    const maxDegrees = kelvinToCentigradetemp(temp_max);
    console.log(feels_like, humidity, visibility, speed, sunrise, sunset)
    const content = document.createElement('section');
    content.classList.add =('section-data-weather')
    content.innerHTML = `
            <h3>Clima en ${name}</h2>
            <img src='https://openweathermap.org/img/wn/${arr.icon}@2x.png' alt'Weather Icon'>
            <p>${arr.main}, ${arr.description}</p>
            <h2>${degrees}°C</h2>
            <p>Max: ${maxDegrees}°C</p>
            <p>Min: ${minDegrees}°C</p>`
    result.appendChild(content);
}

const showError=(message)=>{
    console.log(message);
    const alert = document.createElement('p');
    alert.classList.add('alert=message');
    alert.innerHTML = message;
    form.appendChild(alert);
    setTimeout(()=>{
        alert.remove();
    }, 1000);
}
const clearHTML =()=>{
    result.innerHTML = ''
}

const kelvinToCentigradetemp=(temp)=>parseInt(temp - 273.15);

