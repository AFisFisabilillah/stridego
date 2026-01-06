-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activities (
                                   created_at timestamp with time zone NOT NULL DEFAULT now(),
                                   title character varying,
                                   description text,
                                   visibility character varying,
                                   calorie bigint,
                                   duration bigint,
                                   user_id uuid DEFAULT gen_random_uuid(),
                                   id uuid NOT NULL DEFAULT gen_random_uuid(),
                                   type character varying NOT NULL,
                                   CONSTRAINT activities_pkey PRIMARY KEY (id),
                                   CONSTRAINT acitivites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.activities_images (
                                          id uuid NOT NULL DEFAULT gen_random_uuid(),
                                          image_url character varying,
                                          activity_id uuid DEFAULT gen_random_uuid(),
                                          created_at timestamp with time zone NOT NULL DEFAULT now(),
                                          CONSTRAINT activities_images_pkey PRIMARY KEY (id),
                                          CONSTRAINT activities_images_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id)
);
CREATE TABLE public.activities_running (
                                           id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                           distance double precision,
                                           pace character varying,
                                           created_at timestamp with time zone NOT NULL DEFAULT now(),
                                           activity_id uuid DEFAULT gen_random_uuid(),
                                           route jsonb,
                                           CONSTRAINT activities_running_pkey PRIMARY KEY (id),
                                           CONSTRAINT activities_running_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id)
);
CREATE TABLE public.challange_templates (
                                            title character varying NOT NULL,
                                            description text,
                                            level character varying NOT NULL,
                                            duration_days bigint NOT NULL,
                                            cover_image_url character varying,
                                            created_at timestamp with time zone NOT NULL DEFAULT now(),
                                            id uuid NOT NULL DEFAULT gen_random_uuid(),
                                            CONSTRAINT challange_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.challenge_day_exercises (
                                                id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                                exercise_id uuid NOT NULL DEFAULT gen_random_uuid(),
                                                challenge_day_id bigint NOT NULL,
                                                reps bigint NOT NULL,
                                                duration_second bigint NOT NULL,
                                                created_at timestamp with time zone DEFAULT now(),
                                                CONSTRAINT challenge_day_exercises_pkey PRIMARY KEY (id),
                                                CONSTRAINT challenge_workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id),
                                                CONSTRAINT challenge_workout_exercises_challenge_day_id_fkey FOREIGN KEY (challenge_day_id) REFERENCES public.challenge_days(id)
);
CREATE TABLE public.challenge_days (
                                       id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                       challenge_id uuid DEFAULT gen_random_uuid(),
                                       title text NOT NULL,
                                       day_number bigint NOT NULL,
                                       created_at timestamp with time zone NOT NULL DEFAULT now(),
                                       CONSTRAINT challenge_days_pkey PRIMARY KEY (id),
                                       CONSTRAINT challenge_days_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challange_templates(id)
);
CREATE TABLE public.custom_workout_exercises (
                                                 id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                                 custom_workout_id uuid,
                                                 exercise_id uuid,
                                                 reps bigint,
                                                 duration_second bigint,
                                                 order_index integer,
                                                 created_at timestamp with time zone DEFAULT now(),
                                                 CONSTRAINT custom_workout_exercises_pkey PRIMARY KEY (id),
                                                 CONSTRAINT custom_workout_exercises_custom_workout_id_fkey FOREIGN KEY (custom_workout_id) REFERENCES public.custom_workouts(id),
                                                 CONSTRAINT custom_workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
CREATE TABLE public.custom_workouts (
                                        title character varying,
                                        user_id uuid DEFAULT gen_random_uuid(),
                                        description text,
                                        created_at timestamp with time zone NOT NULL DEFAULT now(),
                                        id uuid NOT NULL DEFAULT gen_random_uuid(),
                                        CONSTRAINT custom_workouts_pkey PRIMARY KEY (id),
                                        CONSTRAINT custom_workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.exercises (
                                  name character varying NOT NULL,
                                  image character varying NOT NULL,
                                  met smallint NOT NULL,
                                  description text,
                                  otot character varying,
                                  created_at timestamp with time zone NOT NULL DEFAULT now(),
                                  id uuid NOT NULL DEFAULT gen_random_uuid(),
                                  CONSTRAINT exercises_pkey PRIMARY KEY (id)
);
CREATE TABLE public.followers (
                                  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                  following_id uuid DEFAULT gen_random_uuid(),
                                  follower_id uuid DEFAULT gen_random_uuid(),
                                  followers_count double precision,
                                  following_count double precision,
                                  created_at timestamp with time zone NOT NULL DEFAULT now(),
                                  CONSTRAINT followers_pkey PRIMARY KEY (id),
                                  CONSTRAINT followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES auth.users(id),
                                  CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES auth.users(id),
                                  CONSTRAINT followers_following_id_fkey1 FOREIGN KEY (following_id) REFERENCES public.profiles(id),
                                  CONSTRAINT followers_follower_id_fkey1 FOREIGN KEY (follower_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
                                 created_at timestamp with time zone DEFAULT now(),
                                 username character varying NOT NULL UNIQUE,
                                 id uuid NOT NULL,
                                 avatar_url text NOT NULL,
                                 fullname character varying NOT NULL,
                                 gender character varying NOT NULL,
                                 weight bigint NOT NULL CHECK (weight > 0),
                                 height bigint NOT NULL CHECK (height > 0),
                                 CONSTRAINT profiles_pkey PRIMARY KEY (id),
                                 CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_challanges (
                                        id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                        user_id uuid DEFAULT gen_random_uuid(),
                                        challenge_id uuid DEFAULT gen_random_uuid(),
                                        completed_at timestamp without time zone,
                                        created_at timestamp with time zone NOT NULL DEFAULT now(),
                                        CONSTRAINT user_challanges_pkey PRIMARY KEY (id),
                                        CONSTRAINT user_challanges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
                                        CONSTRAINT user_challanges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challange_templates(id)
);
CREATE TABLE public.user_challenge_days (
                                            id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                            challenge_days_id bigint NOT NULL,
                                            is_completed boolean NOT NULL,
                                            activity_id uuid DEFAULT gen_random_uuid(),
                                            created_at timestamp with time zone NOT NULL DEFAULT now(),
                                            user_challenge_id bigint,
                                            avg_calorie real,
                                            total_time bigint DEFAULT '0'::bigint,
                                            completed_exercise character varying DEFAULT '0/0'::character varying,
                                            CONSTRAINT user_challenge_days_pkey PRIMARY KEY (id),
                                            CONSTRAINT user_challenge_days_user_challenge_id_fkey FOREIGN KEY (user_challenge_id) REFERENCES public.user_challanges(id),
                                            CONSTRAINT user_challenge_days_challenge_days_id_fkey FOREIGN KEY (challenge_days_id) REFERENCES public.challenge_days(id),
                                            CONSTRAINT user_challenge_days_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id)
);
CREATE TABLE public.user_custom_workouts (
                                             id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                             created_at timestamp with time zone NOT NULL DEFAULT now(),
                                             custom_workout_id uuid DEFAULT gen_random_uuid(),
                                             user_id uuid DEFAULT gen_random_uuid(),
                                             avg_calories double precision,
                                             total_time bigint,
                                             completed_exercise character varying,
                                             activity_id uuid DEFAULT gen_random_uuid(),
                                             CONSTRAINT user_custom_workouts_pkey PRIMARY KEY (id),
                                             CONSTRAINT user_custom_workouts_custom_workout_id_fkey FOREIGN KEY (custom_workout_id) REFERENCES public.custom_workouts(id),
                                             CONSTRAINT user_custom_workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
                                             CONSTRAINT user_custom_workouts_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id)
);
CREATE TABLE public.user_streaks (
                                     id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                     created_at timestamp with time zone NOT NULL DEFAULT now(),
                                     user_id uuid DEFAULT gen_random_uuid(),
                                     current_streak bigint DEFAULT '0'::bigint,
                                     longest_streak bigint DEFAULT '0'::bigint,
                                     last_activity_date date,
                                     CONSTRAINT user_streaks_pkey PRIMARY KEY (id)
);