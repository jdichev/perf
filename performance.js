/**
 * High-def performance measuring
 * Based on https://remysharp.com/2007/04/20/performance-profiling-javascript
 */

(function (context) {
  'use strict';

  var self = context;

  // Poly-fill console object
  // Console-polyfill. MIT license.
  // https://github.com/paulmillr/console-polyfill
  // Make it safe to do console.log() always.
  (function (con) {
    var prop, method;
    var empty = {};
    var dummy = function () {
    };
    var properties = 'memory'.split(',');
    var methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
      'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
      'time,timeEnd,trace,warn').split(',');
    while (prop = properties.pop()) {
      con[prop] = con[prop] || empty;
    }
    while (method = methods.pop()) {
      con[method] = con[method] || dummy;
    }
  })(context.console = context.console || {});

  // Poly-fill performance object
  if (!('performance' in self)) {
    self.performance = {};
  }

  self.performance.now = (function () {

    return self.performance.now ||
      self.performance.mozNow ||
      self.performance.msNow ||
      self.performance.oNow ||
      self.performance.webkitNow ||
      function () {
        return +new Date();
      };
  })();
})(this);

(function (context) {
  'use strict';

  var self = context;

  function defaultReport(l) {
    console.log(l.join('\n'));
  }

  function defaultLineReport(l) {
    console.log(l);
  }

  function error(e) {
    if (self.time.errors) {
      console.log(e);
    }
  }

  // Performance logging
  var timeMap = {};
  var log = [];
  var reportMethod = defaultReport;
  var lineReport = false;
  var lineReportMethod = defaultLineReport;

  // Line report
  function Record(name, start, stop) {
    this.name = name;
    this.start = start;
    this.stop = stop;
    this.delta = stop - start;
  }

  Record.prototype = {
    toString: function () {
      return this.name + ': ' + (this.delta / 1000).toFixed(4) + ' seconds';
    }
  };

  function Timer() {
    // constructor
  }

  Timer.prototype = {
    // start + stop taken from firebuglite.js - http://getfirebug.com/firebuglite
    start: function (name) {
      if (!name) {
        error('start: If starting a timer manually a name must be set');
      } else {
        timeMap[name] = self.performance.now();
      }
    },

    stop: function (name) {
      if (name in timeMap) {
        var stop = self.performance.now();
        var l = new Record(name, timeMap[name], stop);
        log.push(l);
        if (lineReport) {
          lineReportMethod.call(this, l);
        }
        if (this.interactive) {
          console.log(l.toString());
        }
        delete timeMap[name];
      } else {
        error('stop:' + name + ' not found');
      }
    },

    report: function (name) {
      if (typeof name === 'undefined') {
        reportMethod.call(this, log);
      } else {
        var i = log.length;
        var l = [];
        while (i--) {
          if (name === log[i].name) {
            l.push(log[i]);
          }
        }
        reportMethod.call(this, l);
      }
    },

    getLog: function () {
      return log;
    },

    setReportMethod: function (fn) {
      if (fn.hasOwnProperty('hooked')) {
        error('setReportMethod: Cannot use hooked method ' + fn.name);
      } else {
        reportMethod = fn;
      }
    },

    setLineReportMethod: function (fn) {
      if (fn.hasOwnProperty('hooked')) {
        error('setLineReportMethod: Cannot use hooked method ' + fn.name);
      } else {
        lineReportMethod = fn;
        lineReport = true;
      }
    },

    resetLog: function () {
      log.length = 0;
    },

    errors: false,

    interactive: false
  };

  self.time = new Timer();

})(this);
