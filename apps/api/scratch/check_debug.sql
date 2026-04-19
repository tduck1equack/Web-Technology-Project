SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement, 
    action_orientation, 
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users' OR trigger_name = 'on_auth_user_created';

SELECT 
    proname, 
    prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
