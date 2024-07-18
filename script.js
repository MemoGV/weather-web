import {keyWeather, keyIp} from './config.js';

const body = document.querySelector('body');
const currentWeather = document.querySelector('.current-weather');
const alert = document.querySelector('.alert-message')
const form = document.querySelector('.inputSearch');
const nameCountry = document.querySelector('#country');
const weatherTime = document.querySelector('.weather-time')
const sectionFeelsLike = document.querySelector('#section-feels-like');
const sectionWindSpeed = document.querySelector('#section-wind-speed');
const sectionSunset = document.querySelector('#section-sunset');
const sectionHumidity = document.querySelector('#section-humidity');
const sectionVisibility = document.querySelector('#section-visibility');
const sectionDailyWeather = document.querySelector('#section-daily-weather');
const sectionTime = document.querySelector('#weather-time-wrap');
const boxStyle = document.querySelectorAll('.box-style');
const inputText = document.querySelector('#input-text');
const submitBtn = document.querySelector('#submit');
const gitHubBtn = document.querySelector('#git-hub-btn');




form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(inputText.value === '' ){
        showError('Que ciudad buscas?');
        return;
    }
    callAPIWeather(inputText.value);
})
const ipAPICall = async()=>{
    try {
        const request = await fetch(`https://ipinfo.io/json?token=${keyIp}`);
        if(!request.ok) {
            throw new Error(`Error! status: ${request.status}`)};
    const jsonResponse = await request.json();
    const {city} = jsonResponse;
    callAPIWeather(city);
    } catch(error){
    console.error('Error request IP information:', error);
    }
};

ipAPICall();

const callAPIWeather = async(city)=>{
    try{
        const request = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${keyWeather}&lang=es`);
        if(!request.ok){
            throw new Error(`Error! Status: ${request.status}`)
        };
        const JSONResponse = await request.json();
        clearHTML(currentWeather);
        clearHTML(sectionTime);
        clearHTML(sectionFeelsLike);
        clearHTML(sectionHumidity);
        clearHTML(sectionWindSpeed);
        clearHTML(sectionSunset);
        clearHTML(sectionVisibility);
        clearHTML(sectionDailyWeather);
        showWeather(JSONResponse);
        const lat = JSONResponse.coord.lat;
        const lon = JSONResponse.coord.lon;
        const dailyRequest = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${keyWeather}&lang=es`);
        if(!dailyRequest.ok){
            throw new Error(`Error Second Request! Status: ${request.status} `);
        };
        const dailyJSONResponse = await dailyRequest.json();
        showWeatherTime(dailyJSONResponse);
        getDailyWeather(dailyJSONResponse);
    } catch(error){
        console.error('Error request information', error);
        showError('Ciudad no existe')
    }
}
const showWeather=(data)=>{
    const {name, main:{temp,temp_min,temp_max, feels_like, humidity}, weather:[arr], visibility, wind:{speed}, sys:{sunrise, sunset, country}} = data;
    printCurrentWeather(name, country, temp, arr.description, temp_min, temp_max);
    printFeelsLike(feels_like, sectionFeelsLike, 'feels-like');
    printHumidity(humidity, sectionHumidity, 'feels-like');
    printSunset(sunrise, sunset, sectionSunset, 'feels-like');
    printVisibility(visibility, sectionVisibility, 'feels-like');
    
}
const showWeatherTime =(data)=>{
    const {wind:{speed, gust} } = data.list[0];
    printSpeedWind(speed, gust, sectionWindSpeed, 'feels-like');
    for(let i=0; i<9; i++){
        const {dt, main:{temp}, weather:[{description, icon}]} = data.list[i];
        const degrees = kelvinToCentigradetemp(temp)
        const content = document.createElement('article');
        content.classList.add('box-time-weather')
        content.innerHTML = `
            <h3>${unixToTime(dt).getHours()} hrs</h3>
            <img src='https://openweathermap.org/img/wn/${icon}@2x.png' alt'Weather Icon'>
            <p>${description}</p>
            <h2>${degrees}°</h2>`
        sectionTime.appendChild(content);}
}
const getDailyWeather =(data)=>{
    const {list} = data;
    const element = document.createElement('div');
    element.classList.add('title-div-style')
    element.innerHTML= `
        <h2>PRONOSTICO 5 DIAS</h2>
        <img src='./assets/calendar.svg' height=20 width=20>`
    sectionDailyWeather.appendChild(element);
    list.forEach((va)=>{
        const {dt, main:{temp_max}, weather:[{icon}]} = va;
        let time = unixToTime(dt).getHours()
        let day = unixToTime(dt).getDay();
        if(time === 12){
            printDailyWeather(getDayName(day), icon, temp_max, 'daily-weather');
        }
    })
}
const getDayName =(numDay)=>{
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vie', 'Sab'];
    return dayNames[numDay];
}
const printDailyWeather =(day,icon, tempMax, className)=>{
    const degreesMax = kelvinToCentigradetemp(tempMax);
    const element = document.createElement('article');
    element.classList.add(className);
    element.innerHTML = `
        <h4>${day}</h4>
        <img src='https://openweathermap.org/img/wn/${icon}@2x.png' alt'Weather Icon'>
        <h5>Max:</h5>
        <h3>${degreesMax}°</h3>
    `
    sectionDailyWeather.appendChild(element);
}
const printFeelsLike =(data, section, className)=>{
    const degrees = kelvinToCentigradetemp(data)
    const element = document.createElement('article');
    const div = document.createElement('div');
    element.classList.add(className);
    div.classList.add('title-div-style');
    div.innerHTML= `<h2>SENSACION</h2>
        <img src='./assets/thermometer.webp' width=32 height32>`
    element.innerHTML = `
        <h3>${degrees}°</h3>
    `
    section.appendChild(div);
    section.appendChild(element);
}
const printHumidity =(data, section, className)=>{
    const element = document.createElement('article');
    const div = document.createElement('div');
    div.classList.add('title-div-style');
    element.classList.add(className);
    div.innerHTML=`<h2>HUMEDAD</h2>
        <img src='./assets/humidity.webp' width=32 height=32>`
    element.innerHTML = `
        <h3>${data}%<h3/>
    `
    section.appendChild(div);
    section.appendChild(element);
}
const printSpeedWind =(data, data1, section, className)=>{
    const element = document.createElement('article');
    const div = document.createElement('div');
    div.classList.add('title-div-style');
    const VKms = data*3.6
    const RKms = data1*3.6
    element.classList.add(className);
    div.innerHTML=`
        <h2>VIENTO</h2>
        <img src='./assets/wind.svg' width=32 height=32>`
    element.innerHTML = `
        <h3>${Math.ceil(VKms)} <span>Km/h</span></h3>
        <p>Viento</p>
        <h3>${Math.ceil(RKms)} <span>Km/h</span></h3>
        <p>Rafagas</p>
    `
    section.appendChild(div);
    section.appendChild(element);
}
const printSunset=(sunrise, sunset, section, className)=>{
    const element = document.createElement('article');
    const div = document.createElement('div');
    div.classList.add('title-div-style');
    element.classList.add(className);
    div.innerHTML=`<h2>ATARDECER</h2>
        <img src='./assets/sunset.svg' weight=32 height=32>`
    element.innerHTML = `
        <h3>${unixToTime(sunset).getHours()}:${unixToTime(sunset).getMinutes().toString().padStart(2, '0')} <span>Hrs</span></h3>
        <h4>Amancer: ${unixToTime(sunrise).getHours()}:${unixToTime(sunrise).getMinutes().toString().padStart(2, '0')} Hrs</h4>
    `
    section.appendChild(div);
    section.appendChild(element);
}   
const printVisibility=(data, section, className)=>{
    const element = document.createElement('article');
    const div = document.createElement('div');
    const km = Math.ceil(data/1000);
    div.classList.add('title-div-style');
    element.classList.add(className);
    div.innerHTML=`
        <h2>VISIBILIDAD</h2>
        <img src='./assets/eye.svg' height=32 width=32>
    `
    element.innerHTML=`
    <h3>${km}<span> Km</span></h3>
    `
    section.appendChild(div);
    section.appendChild(element);
}
const printCurrentWeather =(name, country, deg, description, minDeg, maxDeg)=>{
    const degrees = kelvinToCentigradetemp(deg);
    const minDegrees = kelvinToCentigradetemp(minDeg);
    const maxDegrees = kelvinToCentigradetemp(maxDeg);
    const element = document.createElement('article');
    element.classList.add('section-data-weather');
    element.innerHTML=`
            <h3>${name}</h3>
            <h4>${country}</h4>
            <h2>${degrees}°</h2>
            <p>${description}</p>
            <p>Maxima: ${maxDegrees}°  Minima: ${minDegrees}°</p>`
    currentWeather.appendChild(element);
}
const showError=(message)=>{
    const alert = document.createElement('p');
    alert.classList.add('alert-message');
    alert.innerHTML = message;
    form.appendChild(alert);
    setTimeout(()=>{
        alert.remove();
    }, 600);
}
const unixToTime =(unix)=>{
    let time = unix*1000;
    let date = new Date(time);
    return date;
}   
const clearHTML =(section)=>{
    section.innerHTML = ''
}
const kelvinToCentigradetemp=(temp)=>parseInt(temp - 273.15);
inputText.addEventListener('focus', ()=>{
    submitBtn.style.backgroundColor = 'rgb(255 255 255 / 95%)';});
inputText.addEventListener('blur', ()=>{
    submitBtn.style.backgroundColor = 'rgb(255, 255, 255, .3)';});
gitHubBtn.addEventListener('click', ()=>{
    window.open('https://github.com/MemoGV', 'blank');});