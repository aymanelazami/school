`
Custom type to goes as object key is string and the values is an array 
goes this way :
{
    "role_name":["section":"action", ...and so on]
}
as an example:
{
    "admin": [
        "session:create",
        "session:read",
        "session:edit",
        "session:delete"
    ],
    "student": [
        "session:read"
    ]
}

now the custom type should be an object and the value of the of all keys should be arrays containing ony strings
in all the strings should contain ':' between the action and section  
`
import { customType } from 'drizzle-orm/pg-core';

export type typePermission = string[]; 

export const permission = customType<{
  data: typePermission;
  driverData: string;
}>({
  dataType() {
    return 'jsonb'; 
  },

  fromDriver(value: unknown): typePermission {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value as typePermission;
  },

  toDriver(value: typePermission): string {
    if (value && Array.isArray(value)) {
      for (const permissionStr of value) {
        if (typeof permissionStr !== 'string') {
          throw new Error(`All permissions must be strings, found: ${typeof permissionStr}`);
        }
        
        if (!permissionStr.includes(':')) {
          throw new Error(`Permission "${permissionStr}" must contain ':' separator in "section:action" format`);
        }
      }
    } else {
      throw new Error('Permissions must be an array');
    }
    
    return JSON.stringify(value);
  },
});