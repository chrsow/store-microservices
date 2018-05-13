
# Authentication service

Written by Phirasit Charoenchitseriwong  
list of all APIs in this service  
Note: all APIs use JSON  

## 1. /api/login
Try to authenticate, create jwt token if the request is granted

#### Parameters

Name | Type | Note
---- | ---- | ----
username | String  | 
password | String | 

#### Response
Name | Type | Note
---- | ---- | -----
success | Bool |
message | String | jwt token
	
## 2. /api/verify
verify jwt token
#### Parameters
Name | Type | Note
---- | ---- | ----
token | String  | jwt token

#### Response
Name | Type | Note
---- | ---- | ----
valid | Bool | 
message | Object | user data

## 3. /api/register
register a new user
#### Parameters
Name | Type | Note
---- | ---- | ----
username | String  |
password | String |

#### Response
Name | Type | Note
---- | ---- | ----
success | Bool |
message | String |

## 4. /api/update
update user password
#### Parameters
Name | Type | Note
---- | ---- | ----
username | String  | 
old_password | String | current password
new_password | String | new password
token | String | jwt token

#### Response
Name | Type | Note
---- | ---- | ----
success | Bool | 
message | String | 


