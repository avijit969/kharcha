import { supabase } from "@/lib/supabase";
import { registerForPushNotificationsAsync } from "./notification";

export const AddLoggedInDevices = async (userId: string, device_name: string) => {
    console.log("userId", userId, "device_name", device_name)
    const expo_push_token = await registerForPushNotificationsAsync()
    // first check if device is already logged in
    const { data: device, error : deviceError} = await supabase.from("logged_in_devices").select("id").eq("user_id", userId).eq("device_name", device_name).single()
    console.log(device)
    if (!device) {
        const { data, error } = await supabase.from("logged_in_devices").insert({ device_name, user_id: userId, expo_push_token })
        if (error) {
            console.log(error)
        }
    }
}