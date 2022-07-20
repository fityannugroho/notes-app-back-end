# Notes API

API for [Notes App Dicoding](http://notesapp-v2.dicodingacademy.com).

## Data

This API will store data that has attributes like the following:

### User

The user has the following attributes:

```json
{
  "id": "string",
  "username": "string",
  "password": "string",
  "fullname": "string"
}
```

This is an example of a user:

```json
{
  "id": "user-Zm_sAf2i8sTGKWSX",
  "username": "johndoe",
  "password": "secret",
  "fullname": "John Doe"
}
```

### Note

The note has the following attributes:

```json
{
  "id": "string",
  "title": "string",
  "body": "string",
  "tags": ["string"],
  "created_at": "string",
  "updated_at": "string"
  "owner": "string"
}
```

This is an example of the note:

```json
{
  "id": "oVwum-U5h_6CoZ-f",
  "title": "Hello World",
  "body": "This is my first note",
  "tags": ["hello", "world"],
  "created_at": "2020-01-01T00:00:00.000Z",
  "updated_at": "2020-01-01T00:00:00.000Z",
  "owner": "user-Zm_sAf2i8sTGKWSX"
}
```
