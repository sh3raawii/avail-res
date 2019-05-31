# Avail-res

The Project is written in NodeJS using ExpressJS

## Install dependencies

Using [yarn](https://yarnpkg.com/en/)
```Shell
$ yarn
```

## Start server

```Shell
$ yarn start
```

## API 

### Health

- `GET /health` Liveness endpoint
- `GET /health/readiness` Readiness endpoint ( not different than Liveness for this application)

### Restaurant

- `GET /restaurant/search/:datetime` Search for open restaurants at certain datetime, note that datetime needs to be valid DateTime Format like `2019-05-31T23:07:53.093`
- `POST /restaurant/csv` upload CSV data for the server to load and serve, you need to send the file as multipart under the key `document`
