const currentWeather = document.querySelector('.current-weather');
const form = document.querySelector('.inputSearch');
const nameCity = document.querySelector('#city');
const nameCountry = document.querySelector('#country');
const weatherTime = document.querySelector('.weather-time')
const sectionFeelsLike = document.querySelector('#section-feels-like');
const sectionWindSpeed = document.querySelector('#section-wind-speed');
const sectionSunset = document.querySelector('#section-sunset');
const sectionHumidity = document.querySelector('#section-humidity');

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(nameCity.value === '' )/*|| nameCountry.value === '')*/{
        showError('Ambos campos son obligatorios');
        return;
    }
    callAPIWeather(nameCity.value);
})

const ipAPICall = async()=>{
    try {
        const request = await fetch(`https://ipinfo.io/json?token=${keyIp}`);
        if(!request.ok) {
            throw new Error(`Error! status: ${request.status}`)};
    const jsonResponse = await request.json();
    const {city, country} = jsonResponse;
    callAPIWeather(city, country);
    } catch(error){
    console.error('Error request IP information:', error);
    }
};

ipAPICall();

const messageIA = async(data)=>{
    const {name, main:{temp, feels_like, humidity}, sunset, weather:[arr]} = data;
    const prompt = `El clima en ${name} es ${arr.description}, temperatura ${temp}°C, humedad ${humidity}%, sensacion ${feels_like}, el atardecer sera a ${sunset},
    puedes darme un resumen y consejos para prepararme para este clima`
    const response = await fetch('https://api.openai.com/v1/completions', {
        method:'POST',
        headers: {
            'content-type':'application/json',
            'authorization': `Bearer ${keyIA}`
        },
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 50,
            model:'gpt-3.5-turbo'
        })
    });
    const message = await response.json();
    console.log(message);
}

const callAPIWeather = async(city)=>{
    try{
        const request = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${keyWeather}&lang=es`);
        if(!request.ok){
            throw new Error(`Error! Status: ${request.status}`)
        };
        const JSONResponse = await request.json();
        clearHTML(currentWeather);
        clearHTML(weatherTime);
        clearHTML(sectionFeelsLike);
        clearHTML(sectionHumidity);
        clearHTML(sectionWindSpeed);
        clearHTML(sectionSunset);
        showWeather(JSONResponse);
        console.log(JSONResponse);
        const lat = JSONResponse.coord.lat;
        const lon = JSONResponse.coord.lon;
        const dailyRequest = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${keyWeather}&lang=es`);
        if(!dailyRequest.ok){
            throw new Error(`Error Second Request! Status: ${request.status} `);
        };
        const dailyJSONResponse = await dailyRequest.json();
        showWeatherTime(dailyJSONResponse);
        console.log(dailyJSONResponse);
    } catch(error){
        console.error('Error request information', error);
        showError('Ciudad no existe')
    }
}

const showWeather=(data)=>{
    const {name, main:{temp,temp_min,temp_max, feels_like, humidity}, weather:[arr], visibility, wind:{speed}, sys:{sunrise, sunset, country}} = data;
    const degrees = kelvinToCentigradetemp(temp);
    const minDegrees = kelvinToCentigradetemp(temp_min);
    const maxDegrees = kelvinToCentigradetemp(temp_max);
    const content = document.createElement('article');
    content.classList.add('section-data-weather');
    clearHTML(content);
    content.innerHTML = `
            <h3>${name}</h3>
            <h4>${country}</h4>
            <h2>${degrees}°</h2>
            <p>${arr.description}</p>
            <p>Maxima: ${maxDegrees}°  Minima: ${minDegrees}°</p>`
    currentWeather.appendChild(content);
    printFeelsLike(feels_like, sectionFeelsLike, 'feels-like');
    printHumidity(humidity, sectionHumidity, 'feels-like');
    printSpeedWind(speed, sectionWindSpeed, 'feels-like');
    printSunset(sunrise, sunset, sectionSunset, 'feels-like');
}
const showWeatherTime =(data)=>{
    for(let i=0; i<9; i++){
        const {dt, main:{temp}, weather:[{description, icon}]  } = data.list[i];
        const degrees = kelvinToCentigradetemp(temp)
        const content = document.createElement('article');
        content.classList.add('box-daily-weather')
        content.innerHTML = `
            <p>${unixToTime(dt).getHours()} hrs</p>
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
const clearHTML =(section)=>{
    section.innerHTML = ''
}
const kelvinToCentigradetemp=(temp)=>parseInt(temp - 273.15);

const printFeelsLike =(data, section, className)=>{
    const degrees = kelvinToCentigradetemp(data)
    const element = document.createElement('article');
    element.classList.add(className);
    element.innerHTML = `
        <h2>SENSACION</h2>
        <img src='./thermometer.webp' width=32 height32>
        <h3>${degrees}°</h3>
    `
    section.appendChild(element);
}
const printHumidity =(data, section, className)=>{
    const element = document.createElement('article');
    element.classList.add(className);
    element.innerHTML = `
        <h2>HUMEDAD</h2>
        <img src='./humidity.webp' width=32 height=32>
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
        <img src='./wind.svg' width=32 height=32>
        <h3>${Math.ceil(KmS)} Km/h</h3>
    `
    section.appendChild(element);
}

const printSunset=(sunrise, sunset, section, className)=>{
    const element = document.createElement('article');
    element.classList.add(className);
    element.innerHTML = `
        <h2>ATARDECER</h2>
        <img src='./sunset.svg' weight=32 height=32>
        <h3>${unixToTime(sunset).getHours()}:${unixToTime(sunset).getMinutes().toString().padStart(2, '0')} Hrs</h3>
        <h4>Amancer: ${unixToTime(sunrise).getHours()}:${unixToTime(sunrise).getMinutes().toString().padStart(2, '0')} Hrs</h4>
    `
    section.appendChild(element);
}   

const unixToTime =(unix)=>{
    let time = unix*1000;
    let date = new Date(time);
    return date;
}   