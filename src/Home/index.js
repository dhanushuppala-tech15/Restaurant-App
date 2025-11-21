// src/Home/index.js
import {useState, useEffect} from 'react'

import Header from '../Header'
import DishItem from '../DishItem'

import './index.css'

const Home = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [response, setResponse] = useState([])
  const [activeCategoryId, setActiveCategoryId] = useState('')

  const [cartItems, setCartItems] = useState([])

  // store restaurant name from API
  const [restaurantName, setRestaurantName] = useState('')

  // map API shape -> UI shape
  const getUpdatedData = tableMenuList =>
    (tableMenuList || []).map(eachMenu => ({
      menuCategory: eachMenu.menu_category,
      menuCategoryId: eachMenu.menu_category_id,
      menuCategoryImage: eachMenu.menu_category_image,
      categoryDishes: (eachMenu.category_dishes || []).map(eachDish => ({
        dishId: eachDish.dish_id,
        dishName: eachDish.dish_name,
        dishPrice: eachDish.dish_price,
        dishImage: eachDish.dish_image,
        dishCurrency: eachDish.dish_currency,
        dishCalories: eachDish.dish_calories,
        dishDescription: eachDish.dish_description,
        dishAvailability: eachDish.dish_Availability,
        dishType: eachDish.dish_Type,
        addonCat: eachDish.addonCat || [],
      })),
    }))

  // Hoisted function so it can be used before its textual location
  function onUpdateActiveCategoryIdx(menuCategoryId) {
    setActiveCategoryId(menuCategoryId)
  }

  // add item to cart
  const addItemToCart = dish => {
    const isAlreadyExists = cartItems.find(item => item.dishId === dish.dishId)
    if (!isAlreadyExists) {
      const newDish = {...dish, quantity: 1}
      setCartItems(prev => [...prev, newDish])
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.dishId === dish.dishId
            ? {...item, quantity: item.quantity + 1}
            : item,
        ),
      )
    }
  }

  // remove item from cart
  const removeItemFromCart = dish => {
    const isAlreadyExists = cartItems.find(item => item.dishId === dish.dishId)
    if (isAlreadyExists) {
      setCartItems(prev =>
        prev
          .map(item =>
            item.dishId === dish.dishId
              ? {...item, quantity: item.quantity - 1}
              : item,
          )
          .filter(item => item.quantity > 0),
      )
    }
  }

  // spinner render
  const renderSpinner = () => (
    <div className="spinner-container">
      <div className="spinner-border" role="status" />
    </div>
  )

  // render tab buttons
  const renderTabMenuList = () =>
    response.map(eachCategory => {
      const onClickHandler = () =>
        onUpdateActiveCategoryIdx(eachCategory.menuCategoryId)

      return (
        <li
          className={`each-tab-item ${
            eachCategory.menuCategoryId === activeCategoryId
              ? 'active-tab-item'
              : ''
          }`}
          key={eachCategory.menuCategoryId}
          onClick={onClickHandler}
        >
          <button
            type="button"
            className="mt-0 mb-0 ms-2 me-2 tab-category-button"
          >
            {eachCategory.menuCategory}
          </button>
        </li>
      )
    })

  // render dishes for active category
  const renderDishes = () => {
    const activeCategory = response.find(
      eachCategory => eachCategory.menuCategoryId === activeCategoryId,
    )

    if (!activeCategory) return null

    const {categoryDishes} = activeCategory

    return (
      <ul className="m-0 d-flex flex-column dishes-list-container">
        {categoryDishes.map(eachDish => (
          <DishItem
            key={eachDish.dishId}
            dishDetails={eachDish}
            cartItems={cartItems}
            addItemToCart={addItemToCart}
            removeItemFromCart={removeItemFromCart}
          />
        ))}
      </ul>
    )
  }

  // fetch API and populate data
  const fetchRestaurantApi = async () => {
    try {
      const api =
        'https://apis2.ccbp.in/restaurant-app/restaurant-menu-list-details'
      const apiResponse = await fetch(api)
      const data = await apiResponse.json()

      // data shape: array where index 0 has restaurant details & table_menu_list
      if (Array.isArray(data) && data[0]) {
        const apiRestaurantName = data[0].restaurant_name || ''
        setRestaurantName(apiRestaurantName)

        const updatedData = getUpdatedData(data[0].table_menu_list || [])
        setResponse(updatedData)
        if (updatedData.length > 0)
          setActiveCategoryId(updatedData[0].menuCategoryId)
      } else if (data && data.table_menu_list) {
        // fallback if response is an object
        const updatedData = getUpdatedData(data.table_menu_list)
        setResponse(updatedData)
        if (updatedData.length > 0)
          setActiveCategoryId(updatedData[0].menuCategoryId)
      } else {
        // empty fallback
        setResponse([])
      }
    } catch (err) {
      // handle errors gracefully
      console.error('Failed to fetch restaurant data', err)
      setResponse([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurantApi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isLoading ? (
    renderSpinner()
  ) : (
    <div className="home-background">
      <Header cartItems={cartItems} restaurantName={restaurantName} />
      <ul className="m-0 ps-0 d-flex tab-container">{renderTabMenuList()}</ul>
      {renderDishes()}
    </div>
  )
}

export default Home
