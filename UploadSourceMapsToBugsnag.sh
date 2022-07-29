# https://docs.bugsnag.com/api/js-source-map-upload/

# Get Bugsnag API key from .env file
if [ -f .env.local ]; then
  export $(cat .env.local | sed "s/#.*//g" | xargs)
else
  echo "$(tput setaf 1)File .env.local not found$(tput sgr 0)"
  exit
fi

# Get all .js.map files
if [ -d ./dist/js ]; then
  cd ./dist/js
  for file in app.*.js.map; do
    [ -f "$file" ] || break
    {
      # Save absolute path
      path="$(pwd)/$file"
      echo "$(tput setaf 3)\nFound $path$(tput sgr 0)"

      # Upload to Bugsnag
      curl --location --request POST 'https://upload.bugsnag.com' \
        --form "apiKey=\"$VUE_APP_BUGSNAG_API_KEY\"" \
        --form "minifiedUrl=\"https://spotify-album-extract.com/js/app.*.js\"" \
        --form "overwrite=true" \
        --form "sourcemap=@\"$path\""
      echo "$(tput setaf 2)\nUploaded $file $(tput sgr 0)"

      # Wait 2 seconds to prevent throttling
      sleep 2
    } || {
      echo "$(tput setaf 1)\nSomething went wrong$(tput sgr 0)"
    }
  done
else
  echo "$(tput setaf 1)Folder /dist/js not found$(tput sgr 0)"
  exit
fi
