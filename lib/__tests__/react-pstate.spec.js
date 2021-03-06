/* global describe, it, expect, beforeEach, jest, spyOn, Promise */
var ReactPersistentState;

jest.dontMock('../react-pstate');

describe('ReactPersistentState', function () {
  'use strict';

  beforeEach(function () {
    ReactPersistentState =
      require('../react-pstate').ReactPersistentState;
  });

  describe('API', function () {
    it('should define a global mixin', function () {
      expect(ReactPersistentState).toBeDefined();
    });

    it('should has the defined API', function () {
      var methods = [
        'setPId',
        'setPStorage',
        'setPState',
        'removePState',
        'localStorage'
      ];
      methods.forEach(function (m) {
        expect(ReactPersistentState[m]).toBeDefined();
      });
    });

  });

  it('should set the _pid by using setPId', function () {
    ReactPersistentState.setPId('foo');
    expect(ReactPersistentState._pid).toBe('foo');
  });

  it('should set the storage using setPStorage', function () {
    var storage = {};
    ReactPersistentState.setPId('foo');
    ReactPersistentState.setPStorage(storage);
    expect(ReactPersistentState._pstorage).toBe(storage);
  });

  describe('setPState', function () {
    it('should throw an error when the storage is invalid', function () {
      try {
        ReactPersistentState.setPState(null);
        expect(false).toBeTruthy();
      } catch (e) {
        expect(e).toBeDefined();
      }

      try {
        ReactPersistentState.setPState({});
        expect(false).toBeTruthy();
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('should invoke the storage `set` method when invoked', function () {
      var storage = {
        set: function () {}
      };
      spyOn(storage, 'set').andReturn(Promise.resolve());
      ReactPersistentState.setPId('foo');
      ReactPersistentState.setPStorage(storage);
      ReactPersistentState.setState = function (state, cb) {
        cb();
      };
      ReactPersistentState.setPState({});
      expect(storage.set).toHaveBeenCalled();
    });

    it('should invoke `set` with the correct parameters with id', function () {
      var storage = {
        set: function () {}
      };
      spyOn(storage, 'set').andReturn(Promise.resolve());
      ReactPersistentState.setPId('foo');
      ReactPersistentState.setState = function (state, cb) {
        cb();
      };
      ReactPersistentState.setPStorage(storage);
      ReactPersistentState.setPState({
        baz: 'bar'
      });
      expect(storage.set).toHaveBeenCalledWith('foo', {
        baz: 'bar'
      });
    });

    it('should invoke the `cb` provided to `setPState`', function () {
      var storage = {
        set: function () {}
      };
      spyOn(storage, 'set').andReturn({
        then: function (fn) {
          fn();
        }
      });
      ReactPersistentState.setPId('baz');
      ReactPersistentState.setPStorage(storage);
      ReactPersistentState.setState = function (state, cb) {
        cb();
      };
      var called = false;
      ReactPersistentState.setPState('bar', function () {
        called = true;
      });
      expect(called).toBeTruthy();
    });
  });

  it('should invoke storage `remove` when removePState called',
    function () {
      var storage = {
        remove: function () {
          return Promise.resolve();
        }
      };
      spyOn(storage, 'remove');
      ReactPersistentState.setPId('foo');
      ReactPersistentState.setPStorage(storage);
      ReactPersistentState.removePState();
      expect(storage.remove).toHaveBeenCalled();
    });

  describe('restorePState', function () {
    it('should work with explicit `id`', function () {
      var storage = {
        get: function (id) {
          expect(id).toBe('foo');
          return {
            then: function (fn) {
              fn();
            }
          };
        }
      };
      ReactPersistentState.setPId('foo');
      ReactPersistentState.setPStorage(storage);
      ReactPersistentState.setState = function () {};
      spyOn(ReactPersistentState, 'setState');
      ReactPersistentState.restorePState();
      expect(ReactPersistentState.setState).toHaveBeenCalled();
    });
  });

});
