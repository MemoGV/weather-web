const currentWeather = document.querySelector('.current-weather');
const form = document.querySelector('.weather');
const nameCity = document.querySelector('#city');
const nameCountry = document.querySelector('#country');
const weatherTime = document.querySelector('.weather-time')
const sectionFeelsLike = document.querySelector('#section-feels-like');
const sectionWindSpeed = document.querySelector('#section-wind-speed');
const sectionSunset = document.querySelector('#section-sunset');
const sectionHumidity = document.querySelector('#section-humidity');


form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(nameCity.value === '' || nameCountry.value === ''){
        showError('Ambos campos son obligatorios');
        return;
    }

    callAPI(nameCity.value, nameCountry.value);
})

const callAPI=(city, country)=>{
    const apiId = '';
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

const showWeather=(data)=>{
    const {name, main:{temp,temp_min,temp_max, feels_like, humidity}, weather:[arr], visibility, wind:{speed}, sys:{sunrise, sunset}} = data;
    const degrees = kelvinToCentigradetemp(temp);
    const minDegrees = kelvinToCentigradetemp(temp_min);
    const maxDegrees = kelvinToCentigradetemp(temp_max);
    const content = document.createElement('article');
    content.classList.add('section-data-weather')
    content.innerHTML = `
            <h3>${name}</h3>
            <img src='https://openweathermap.org/img/wn/${arr.icon}@2x.png' alt'Weather Icon'>
            <h2>${degrees}°</h2>
            <p>${arr.description}</p>
            <p>Maxima: ${maxDegrees}°  Minima: ${minDegrees}°</p>`
    currentWeather.appendChild(content);
    printFeelsLike(feels_like, sectionFeelsLike, 'feels-like');
    printHumidity(humidity, sectionHumidity, 'feels-like');
    printSpeedWind(speed, sectionWindSpeed, 'feels-like');
    printSunset(sunset, sectionSunset, 'feels-like');
}
const showWeatherTime =(data)=>{
    for(let i=0; i<8; i++){
        const arr = data.list[i];
        const {temp} = arr.main;
        const [{main, description, icon}] = arr.weather;
        const degrees = kelvinToCentigradetemp(temp)
        const content = document.createElement('article');
        content.classList.add('box-daily-weather')
        content.innerHTML = `
            <img src='https://openweathermap.org/img/wn/${icon}@2x.png' alt'Weather Icon'>
            <p>${description}</p>
            <h2>${degrees}°</h2>`
        weatherTime.appendChild(content);
    }
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
    currentWeather.innerHTML = ''
}
const kelvinToCentigradetemp=(temp)=>parseInt(temp - 273.15);

const printFeelsLike =(data, section, className)=>{
    const degrees = kelvinToCentigradetemp(data)
    const element = document.createElement('article');
    element.classList.add(className)
    element.innerHTML = `
        <h2>Sensacion</h2>
        <h3>${degrees}°</h3>
    `
    section.appendChild(element);
}
const printHumidity =(data, section, className)=>{
    const element = document.createElement('article');
    element.classList.add(className);
    element.innerHTML = `
        <h2>Humedad</h2>
        <h3>${data}%<h3/>
    `
    section.appendChild(element);
}

const printSpeedWind =(data, section, className)=>{
    const element = document.createElement('article');
    const KmS = data*3.6
    element.classList.add(className);
    element.innerHTML = `
        <h2>Viento</h2>
        <h3>${KmS}Km/h</h3>
    `
    section.appendChild(element);
}

const printSunset=(data, section, className)=>{
    let time = data*1000;
    let date = new Date(time);
    let utcDate = date.toUTCString();
    const element = document.createElement('article');
    element.classList.add(className);
    element.innerHTML = `
        <h2>Atarceder</h2>
        <h3>${utcDate}</h3>
    `
    section.appendChild(element);
}   
