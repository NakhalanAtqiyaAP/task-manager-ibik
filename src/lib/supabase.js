import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cmhweigxwsunqybxwscv.supabase.co'
const supabaseKey = 'sb_publishable_YesA0KNY4hf1noyokLnfLg_s4JBwYu7'

export const supabase = createClient(supabaseUrl, supabaseKey)