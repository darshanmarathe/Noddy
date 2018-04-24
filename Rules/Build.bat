cls 
del dist/*.js
call tsc Main.ts --lib es2017 --outDir dist
node dist/Main.js