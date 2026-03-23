UPDATE auth.users SET email = 'guy@demo.com', raw_user_meta_data = jsonb_set(raw_user_meta_data, '{full_name}', '"Guy Gruper"') WHERE email = 'alex@demo.com';
