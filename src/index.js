require('dotenv').config();
const express = require('express'),
    createError = require('http-errors'),
    bosyParser = require('body-parser'),
    cors = require('cors'),
    app = express(),
    logger = require('morgan'),
    port = process.env.PORT || 3000;

app.use(bosyParser.json());
app.use(logger('dev'));
app.use(cors());

require('./routes')(app);

app.listen(port, () => {
    console.log(`✅ Listening on port ${port}`);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404, 'Not found'));
});

// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;

    // render the error page
    res.status(err.status || 500).json({
        error: {
            code: err.status || 500,
            message: err.message
        }
    });
});