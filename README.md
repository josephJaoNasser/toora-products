# toora-products

### BEFORE MAKING ANY CHANGES OR RUNNING THE CODE
- Please install the dependencies before running using ```npm install``` or ```yarn```
- If you want to make any changes, run ```npm run dev``` or ```yarn dev``` to run the typescript watcher
- You can change the pagination parameters in the ```index.ts``` file in the root directory
- You can change the credentials in the ```credentials.ts``` file in the root directory
- the output csv files are found in the ```/output``` directory. Each page is a different file

### WHENEVER THE REQUESTS TIME OUT OR FAIL
- you can check the console to see which page has failed
- change the ```START_PAGE``` variable in the ```index.ts``` file to the page that the request failed in

### Get and export products to csv in an ecwid format
```
yarn go
```
or
```
npm run go
```
