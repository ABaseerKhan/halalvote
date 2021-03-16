## Pre-requisites:
* Install yarn globally
## Initial Development Set-up Instructions:
* `cd` into project root
* Run `cp .example.env.dev .env.dev` **(For windows, run: 'copy .example.env.dev .env.dev')
* Manually populate variables in `.env.dev` file
* Run `yarn`
* Run `yarn start`

>Your development server should now be serving the app at localhost:3000

## Deployment
* `cd` into project root
* Run `cp .example.env.prod .env.prod`
* Manually populate variables in `.env.prod` file
* Run `yarn`
* Run `yarn deploy:halal` if deploying to halalvote.com
* Run `yarn deploy:haram` if deploying to haramvote.com
