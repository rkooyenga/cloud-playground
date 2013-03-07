/**
 * AngularUI - The companion suite for AngularJS
 * @version v0.3.2 - 2013-01-31
 * @link http://angular-ui.github.com
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */


angular.module('ui.config', []).value('ui.config', {});
angular.module('ui.filters', ['ui.config']);
angular.module('ui.directives', ['ui.config']);
angular.module('ui', ['ui.filters', 'ui.directives', 'ui.config']);

/*global angular, CodeMirror, Error*/
/**
 * Binds a CodeMirror widget to an element.
 * TODO: try to merge the following changes to upstream:
 * https://github.com/angular-ui/angular-ui
 *
 * This directive is slightly modified from the original version
 * (version v0.3.2).
 *
 * The local changes are:
 * 1. Allow elements other than textarea.
 * 2. Add codeMirror object to the scope.
 *
 */
angular.module('ui.directives')
.directive('uiCodemirror',
           ['ui.config', '$timeout', function(uiConfig, $timeout) {
  'use strict';

  var events = ['cursorActivity', 'viewportChange', 'gutterClick', 'focus',
                'blur', 'scroll', 'update'];
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elm, attrs, ngModel) {
      var options, opts, onChange, deferCodeMirror, codeMirror;

      options = uiConfig.codemirror || {};
      opts = angular.extend({}, options, scope.$eval(attrs.uiCodemirror));

      onChange = function(aEvent) {
        return function(instance, changeObj) {
          var newValue = instance.getValue();
          if (newValue !== ngModel.$viewValue) {
            ngModel.$setViewValue(newValue);
            scope.$apply();
          }
          if (typeof aEvent === 'function')
            aEvent(instance, changeObj);
        };
      };

      deferCodeMirror = function() {
        codeMirror = CodeMirror(elm[0], opts);
        codeMirror.on('change', onChange(opts.onChange));

        for (var i = 0, n = events.length, aEvent; i < n; ++i) {
          aEvent = opts['on' + events[i].charAt(0).toUpperCase() +
                        events[i].slice(1)];
          if (aEvent === void 0) continue;
          if (typeof aEvent !== 'function') continue;
          codeMirror.on(events[i], aEvent);
        }

        // CodeMirror expects a string, so make sure it gets one.
        // This does not change the model.
        ngModel.$formatters.push(function(value) {
          if (angular.isUndefined(value) || value === null) {
            return '';
          }
          else if (angular.isObject(value) || angular.isArray(value)) {
            throw new Error(
              'ui-codemirror cannot use an object or an array as a model');
          }
          return value;
        });

        // Override the ngModelController $render method, which is
        // what gets called when the model is updated.  This takes
        // care of the synchronizing the codeMirror element with the
        // underlying model, in the case that it is changed by
        // something else.
        ngModel.$render = function() {
          codeMirror.setValue(ngModel.$viewValue);
        };
        // pass codeMirror object to the scope.
        scope.codeMirror = codeMirror;
      };

      $timeout(deferCodeMirror);

    }
  };
}]);
