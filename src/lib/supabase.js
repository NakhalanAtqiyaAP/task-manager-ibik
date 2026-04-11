import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktjdniwntsfqbnjmwhve.supabase.co'
const supabaseKey = 'sb_publishable_6hAUyC4QSRNFUZrg9awJaA_YXKtZ7Ij'

export const supabase = createClient(supabaseUrl, supabaseKey)