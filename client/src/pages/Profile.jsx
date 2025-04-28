import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {useRef} from 'react'

export default function Profile() {

  const fileRef = useRef(null)
  const {currentUser} = useSelector((state) => state.user)
const [file, setFile] = useState(undefined)

console.log('file', file)

useEffect(() => {
  if(file){
    handleFileUpload(file)
  }
}, [file])

const handleFileUpload =(file) => {
 // will handle later 

  
}
  return (
    <div className='p-3 max-w-lg mx-auto'>
   <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
   <form className='flex flex-col gap-4'>
    <input onChange={(e) => setFile(e.target.files[0])}type='file' ref={fileRef} hidden accept='image/*'></input>
    <img onClick={() => fileRef.current.click()}className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' src= {currentUser.avatar} alt='profile'></img>
   <input id='username' type='text' placeholder='username' className='border p-3 rounded-lg'></input>
   <input id='email' type='email' placeholder='email' className='border p-3 rounded-lg'></input>
   <input id='password' type='text' placeholder='password' className='border p-3 rounded-lg'></input>
   <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover: opacity-95 disabled:opacity-80'>Update</button>
   </form>

   <div className='flex justify-between mt-5'>
    <span className ='text-red-700 cursor-pointer'>Delete Account</span>
    <span className='text-red-700 cursor-pointer'>Sign Out</span>
   </div>
    </div>
  )
}
