# Firebase setup

1. Go to https://console.firebase.google.com/
1. Create a project if you don't have one or go to the existing project. Example:
   ![](images/firebase_project_overview.jpg)
1. Go to Project Settings
   ![](images/firebase_project_settings.jpg)
1. Scroll down and create app
   ![](images/firebase_project_create_web_app.jpg)
1. Name your app (For example: my-awesome-log-browser)
1. Press Register App
   ![](images/firebase_project_create_web_app_registration.jpg)
1. Populate values from `firebaseConfig` into `.env.local` file
   ![](images/firebase_project_web_firebase_config.jpg)
1. Press Continue to console
1. On the left press on Authentication and choose Google in the Sign-in method
   ![](images/firebase_project_google_authentication.jpg)
1. Enable the google provider by toggling Enable switch and set the Project support email
   ![](images/firebase_project_google_authentication_enabled.jpg)
1. Press Save button
1. Go to `Authentication->Settings->Authorized domains` and add the appengine domain. The url will be `https:logbrowserfronted-dot-PROJECT_ID.uc.r.appspot.com` where `PROJECT_ID` is the value of `project` set in `terraform.tfvars` in [terraform](../terraform/) directory.
   ![](images/firebase_project_authentication_domain.jpg)
