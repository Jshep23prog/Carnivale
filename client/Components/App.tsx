import React, {useEffect, useState, useContext, createContext, useRef} from 'react';
import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements, useLoaderData} from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react';
import ProtectedRoute from './ProtectedRoutes'
import axios from 'axios';
import { io } from 'socket.io-client'
const socket = io()

import FeedPage from './FeedPage'
import HomePage from './HomePage'
import MapPage from './MapPage'
import UserPage from './UserPage'
import Login from './Login'
import MainForum from './MainForum';
import Costume from './Costume';
import EventPage from './EventPage';
import NavBar from './NavBar';
import Loading from './Loading';


const App = () => {
  
  const { user, isLoading, isAuthenticated } = useAuth0();
  const [userData, setUserData] = useState(null);
  const userRef = useRef(null);

  const [lng, setLng] = useState(0)
  const [lat, setLat] = useState(0)


  const getUser = async () => {
    try {
      const { data } = await axios.post(`api/home/user/`, { user });
      setUserData(data[0]);
    } catch (err) {
      console.error(err);
    }
  }
  
  if(isAuthenticated){
    if(userRef.current === null){
      getUser();
      userRef.current = userData;
      //console.log('userDATA:', userData)
    }
  }




  const getLocation = () => {
    if (navigator.geolocation) {
      return navigator.geolocation.getCurrentPosition(showPosition)
    } else {
      console.log("Geolocation is not supported by this browser")
      return null
    }
  }
  
  const showPosition = (position: any) => {
    //console.log(position)
    setLng(position.coords.longitude);
    setLat(position.coords.latitude);

    // it first inits with the emit when home page calls the function, 
    // this is sent to the server side to udate the database
    socket.emit('userLoc', {longitude: position.coords.longitude, latitude: position.coords.latitude })
    console.log('end of socket emit func',{longitude: position.coords.longitude, latitude: position.coords.latitude } )
  }

  useEffect(() => {
    getLocation();
  }, []);

  // useEffect(() => {
  //   // this coords is data.dataValues from the database as a response to the emit
  //   socket.on('userLoc', (coords: any) => {
  //     console.log('userLoc', coords.longitude, coords.latitude)

  //     //set the coords with the response
  //     setLng(coords.longitude);
  //     setLat(coords.latitude);
      
  //     console.log('lng lat', lng, lat)
  //   })
  // }, [])




  if (isLoading) {
    return <Loading />;
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
          <Route path='/' element={<Login />} />
        {/* <Route element={<ProtectedRoute />}>  */}
          <Route path='/homepage' element={<div><HomePage getLocation={getLocation} lat={lat} lng={lng} userData={userData}/> <NavBar /></div>}  />
          <Route path='/mappage' element={<div><MapPage userLat={lat} userLng={lng} /> <NavBar /></div>}/>
          <Route path='/feedpage' element={<div><FeedPage  /> <NavBar /></div>}/>
          <Route path='/eventpage' element={<div><EventPage /> <NavBar /></div>} />
          <Route path='/userpage' element={<div><UserPage  getLocation = {getLocation} lng={lng} lat={lat} /> <NavBar /></div>} />
          {/* <Route path='/photo' element={<div><Photos /> <NavBar /></div>} /> */}
        {/* </Route>  */}
      </Route>,
    ),
  );

  return (
    <RouterProvider router={router} />
  );

};

export default App;
