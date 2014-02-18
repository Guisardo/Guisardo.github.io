var Storage = new function()
{
	
	this.get = function(key)
	{
		return $.jStorage.get(key);
	};
	this.set = function(key, value)
	{
		$.jStorage.set(key, value);
	};
	this.flush = function()
	{
		$.jStorage.flush();
	};
};