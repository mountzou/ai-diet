"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext";
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { getFirestoreDb } from "@/lib/firebase"
import { doc, setDoc, collection, getDocs, deleteDoc, query, orderBy, where, onSnapshot } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Category styling
const CATEGORY_STYLES = {
  work: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  personal: "bg-green-100 text-green-800 hover:bg-green-200",
  family: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  other: "bg-gray-100 text-gray-800 hover:bg-gray-200",
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "12:00",
    category: "work",
  })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isViewEventOpen, setIsViewEventOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Month grid
  const firstDay = startOfMonth(date)
  const lastDay = endOfMonth(date)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })

  // Calculate timestamp ranges for the current month view
  const getMonthTimestampRange = () => {
    // Start of the month at midnight
    const monthStart = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1, 0, 0, 0).getTime()
    // End of the month at 23:59:59
    const monthEnd = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 23, 59, 59).getTime()
    return { start: monthStart, end: monthEnd }
  }

  // Fetch events for the current month
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        // Only fetch events if there's a logged-in user
        if (!user || !user.uid) {
          setEvents([])
          setIsLoading(false)
          return
        }

        const db = await getFirestoreDb()
        // Use nested path with user ID: users/{userId}/calendar
        const calendarRef = collection(db, "users", user.uid, "calendar")
        const { start, end } = getMonthTimestampRange()
        
        // Create a query that only fetches events within the current month's range
        const eventsQuery = query(
          calendarRef,
          where("timestamp", ">=", start),
          where("timestamp", "<=", end),
          orderBy("timestamp")
        )

        // Set up a real-time listener
        const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
          const fetchedEvents = []
          snapshot.forEach(doc => {
            fetchedEvents.push({ id: doc.id, ...doc.data() })
          })
          setEvents(fetchedEvents)
          setIsLoading(false)
        }, (error) => {
          console.error("Error fetching events:", error)
          setIsLoading(false)
        })

        // Cleanup function to unsubscribe from the listener when component unmounts
        // or when the dependency array changes
        return () => unsubscribe()
      } catch (error) {
        console.error("Error setting up event listener:", error)
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [date, user]) // Re-fetch events when the displayed month changes or user changes

  // Helpers
  const generateTimestamp = (dateStr, timeStr) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const [h, min] = timeStr.split(':').map(Number)
    return new Date(y, m - 1, d, h, min).getTime().toString()
  }
  
  const getEventsForDay = day =>
    events.filter(e => e.date === format(day, "yyyy-MM-dd"))

  // Add
  const handleAddEvent = async () => {
    try {
      // Check if user is logged in
      if (!user || !user.uid) {
        console.error("User not authenticated")
        return
      }

      const db = await getFirestoreDb()
      const timestamp = generateTimestamp(newEvent.date, newEvent.time)
      const eventData = {
        ...newEvent,
        timestamp: parseInt(timestamp),
        createdAt: Date.now(),
        userId: user.uid, // Store user ID with the event data for additional reference
      }
      
      // Use nested path: users/{userId}/calendar/{timestamp}
      await setDoc(doc(db, "users", user.uid, "calendar", timestamp), eventData)
      
      // The onSnapshot listener will automatically update the UI
      // so we don't need to manually update the events state here
      
      setNewEvent({
        title: "", description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "12:00", category: "work",
      })
      setIsAddEventOpen(false)
    } catch (error) {
      console.error("Error adding event:", error)
    }
  }

  // View / delete
  const handleEventClick = event => {
    setSelectedEvent(event)
    setIsViewEventOpen(true)
  }
  
  const handleDeleteEvent = async (id) => {
    try {
      // Check if user is logged in
      if (!user || !user.uid) {
        console.error("User not authenticated")
        return
      }

      const db = await getFirestoreDb()
      // Use nested path: users/{userId}/calendar/{eventId}
      await deleteDoc(doc(db, "users", user.uid, "calendar", id))
      // The onSnapshot listener will automatically update the UI
      setIsViewEventOpen(false)
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  // Function to get color intensity based on number of events
  const getDayHighlight = (dayEvents) => {
    if (!dayEvents.length) return ""
    const intensity = Math.min(dayEvents.length * 10, 50) // Cap at 50% intensity
    return `bg-blue-${intensity}`
  }

  return (
    <div className="flex flex-col h-full">
      {!user && (
        <div className="text-center py-8 px-4">
          <h2 className="text-xl font-semibold text-gray-700">Please Sign In</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to view and manage your calendar.</p>
        </div>
      )}
      <Card className="w-full max-w-6xl mx-auto shadow-md">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle>Calendar</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => setDate(addDays(date, -30))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold">{format(date, "MMMM yyyy")}</h2>
              <Button variant="outline" size="icon" onClick={() => setDate(addDays(date, 30))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setIsAddEventOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="text-center font-medium p-2">{d}</div>
            ))}
            {Array(firstDay.getDay()).fill(null).map((_, i) =>
              <div key={i} className="h-32 p-1 bg-gray-50 border border-gray-100" />
            )}
            {days.map(day => {
              const dayEvents = getEventsForDay(day)
              const hasEvents = dayEvents.length > 0
              
              return (
                <div key={day.toString()}
                  className={cn(
                    "h-32 p-1 border border-gray-100 overflow-y-auto",
                    isToday(day) && "bg-blue-50",
                    !isSameMonth(day, date) && "bg-gray-50 text-gray-400",
                    hasEvents && !isToday(day) && "bg-blue-25" // Very subtle highlight for days with events
                  )}
                >
                  <div className={cn(
                    "font-medium text-sm mb-1 flex items-center",
                    hasEvents && "text-blue-600"
                  )}>
                    <span>{format(day, "d")}</span>
                    {hasEvents && (
                      <Badge variant="outline" className="ml-1 h-5 min-w-5 rounded-full px-1 text-xs">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {isLoading
                      ? <div className="text-xs text-gray-400">Loading...</div>
                      : dayEvents.map(evt => (
                        <Button
                          key={evt.id}
                          variant="ghost" size="sm"
                          className={cn(
                            "w-full justify-start text-left text-xs py-1 px-2",
                            CATEGORY_STYLES[evt.category] || CATEGORY_STYLES.other
                          )}
                          onClick={() => handleEventClick(evt)}
                        >
                          <span className="truncate">{evt.time} – {evt.title}</span>
                        </Button>
                      ))
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Event */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Create a new event.</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Event description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newEvent.category}
                  onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                <Badge className={cn(
                  "mt-1",
                  CATEGORY_STYLES[selectedEvent.category] || CATEGORY_STYLES.other
                )}>
                  {selectedEvent.category}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {format(parseISO(selectedEvent.date), "MMMM d, yyyy")} at {selectedEvent.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p>{selectedEvent.description || "No description provided"}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewEventOpen(false)}>Close</Button>
              <Button variant="destructive" onClick={() => handleDeleteEvent(selectedEvent.id)}>
                Delete Event
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}