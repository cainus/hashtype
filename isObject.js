
// pretty incomplete, but good enough for now
function isObject(obj) {
  if (!obj){
    return false;
  }
  var type = typeof obj;
  if (type !== 'object'){
    return false;
  }
  if (Array.isArray(obj)){
    return false;
  }
  if (obj instanceof Date){
    return false;
  }
  if (obj instanceof String){
    return false;
  }
  if (obj instanceof Number){
    return false;
  }
  if (obj instanceof Boolean){
    return false;
  }
  return true;
};



module.exports = isObject;
