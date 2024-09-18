import React, { useEffect, useState } from "react"
import GooglePlacesAutocomplete from "react-google-places-autocomplete"
import { Input } from "@/components/ui/input"
import { AI_PROMPT, SelectBudgetOptions,SelectTravelList } from "@/constants/options"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { chatSession } from "@/service/AIModal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google"
import axios from "axios"
import { doc, setDoc } from "firebase/firestore"; 
import { db } from "@/service/firebaseConfig"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom"

function CreateTrip() {
  const [place,setPlace]=useState();
  const [formData,setFromData]=useState([]);
  const [openDialog,setOpenDialog]=useState(false);
  const [loading,setLoading]=useState(false);
  const navigate=useNavigate();


  const handleInputChange=(name,value)=>{
    setFromData({
      ...formData,
      [name]:value
    })
  }
  useEffect(()=>{ 
    console.log(formData)
  },[formData])

  const login=useGoogleLogin({
    onSuccess:(codeResp)=>GetUserProfile(codeResp),
    onError:(error)=>console.log(error)
  })

  const OnGenerateTrip = async()=>{
    const user = localStorage.getItem('user')
    if(!user){
      setOpenDialog(true)
      return ;
    }
    if(formData?.totalDays>5 || !formData?.location || !formData?.budget || !formData?.traveler){
      toast("Please fill all details!")
      return ;
    }
    toast("Form generated.");
    setLoading(true);
    const FINAL_PROMPT=AI_PROMPT
    .replace('{location}',formData?.location)
    .replace('{totalDays}',formData?.totalDays)
    .replace('{traveler}',formData?.traveler)
    .replace('{budget}',formData?.budget)

    const result=await chatSession.sendMessage(FINAL_PROMPT);
    // console.log("--",result?.response?.text());
    setLoading(false);
    SaveAiTrip(result?.response?.text());
  } 

  const SaveAiTrip=async(TripData) => {
    setLoading(true);
    const user=JSON.parse(localStorage.getItem("user"));
    const docId=Date.now().toString();
    await setDoc(doc(db, "AiTrips", docId), {
      userSelection:formData,
      tripData:JSON.parse(TripData),
      userEmail:user?.email,
      id:docId
    });
    setLoading(false);
    navigate('/view-trip/'+docId);
  }