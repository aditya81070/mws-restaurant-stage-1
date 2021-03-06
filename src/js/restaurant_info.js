let restaurant
var newMap

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap()
})

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error)
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      })
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiYWRpdHlhODEwNzAiLCJhIjoiY2ptMGJhZmdhMjRsaTNwbDg1bTFxNjh5cCJ9.1f0IbEwkns8Do3ptLiYdbg',
        maxZoom: 18,
        attribution: false,
        id: 'mapbox.streets'
      }).addTo(newMap)
      fillBreadcrumb()
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap)
      document.querySelector('.leaflet-control-attribution').remove()
    }
  })
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return
  }
  const id = getParameterByName('id')
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null)
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant
      if (!restaurant) {
        console.error(error)
        return
      }
      fillRestaurantHTML()
      callback(null, restaurant)
    })
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name')
  name.innerHTML = restaurant.name
  name.tabIndex = 0

  const address = document.getElementById('restaurant-address')
  address.tabIndex = 0
  address.innerHTML = '<strong>Address:- </strong>' + restaurant.address

  const image = document.getElementById('restaurant-img')
  image.className = 'restaurant-img img-fluid img-thumbnail'
  image.src = DBHelper.imageUrlForRestaurant(restaurant)

  const cuisine = document.getElementById('restaurant-cuisine')
  cuisine.innerHTML = restaurant.cuisine_type
  cuisine.tabIndex = 0
  cuisine.setAttribute('aria-label', 'Cuisine')

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML()
  }
  // fill reviews
  fillReviewsHTML()
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours')
  for (let key in operatingHours) {
    const row = document.createElement('tr')

    const day = document.createElement('td')
    day.innerHTML = key
    row.appendChild(day)

    const time = document.createElement('td')
    time.innerHTML = operatingHours[key]
    row.appendChild(time)

    hours.appendChild(row)
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container')
  const title = document.createElement('h2')
  title.className = 'review-heading py-2'
  title.innerHTML = 'Reviews'
  container.insertAdjacentElement('afterbegin', title)

  if (!reviews) {
    const noReviews = document.createElement('p')
    noReviews.innerHTML = 'No reviews yet!'
    container.appendChild(noReviews)
    return
  }
  const row = document.getElementById('reviews-list')
  reviews.forEach(review => {
    row.appendChild(createReviewHTML(review))
  })
  container.appendChild(row)
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const div = document.createElement('div')
  const info = document.createElement('div')
  info.tabIndex = 0
  info.className = 'px-1 py-2 review-info'
  div.className = 'col-lg-4 col-md-6 col-sm-12  review mx-1 my-3'
  const name = document.createElement('h4')
  name.innerHTML = review.name
  name.className = 'reviewer-name pt-2 px-2'
  info.appendChild(name)

  const date = document.createElement('span')
  date.innerHTML = review.date
  date.className = 'float-right date text-warning'
  name.appendChild(date)

  const rating = document.createElement('p')
  rating.innerHTML = `Rating: ${review.rating}`
  rating.className = 'btn rating'
  info.appendChild(rating)

  const comments = document.createElement('p')
  comments.innerHTML = review.comments
  info.appendChild(comments)
  div.appendChild(info)
  return div
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb')
  const li = document.createElement('li')
  const a = document.createElement('a')
  a.href = window.location
  // add screen reader accessibility to breadcrumb link
  a.setAttribute('aria-current', 'page')
  a.innerHTML = restaurant.name
  li.appendChild(a)
  breadcrumb.appendChild(li)
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) { url = window.location.href}
  name = name.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`)

    
results = regex.exec(url)
  if (!results) { return null}
  if (!results[2]) { return ''}
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}
