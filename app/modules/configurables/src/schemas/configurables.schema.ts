/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "gameTitle",
      type: "string",
      required: true,
      label: "Game Title",
      minLength: 1,
      maxLength: 60,
    },
    {
      fieldName: "gameSubtitle",
      type: "string",
      required: false,
      label: "Game Subtitle / Tagline",
      maxLength: 120,
    },
    {
      fieldName: "gameDescription",
      type: "string",
      required: false,
      label: "Game Description (intro screen)",
      maxLength: 300,
    },
    {
      fieldName: "playerSpeed",
      type: "number",
      required: false,
      label: "Player Speed (pixels/frame)",
      min: 1,
      max: 10,
    },
    {
      fieldName: "ghostCount",
      type: "number",
      required: false,
      label: "Number of Ghosts",
      min: 1,
      max: 8,
    },
    {
      fieldName: "enableJumpScares",
      type: "boolean",
      required: false,
      label: "Enable Jump Scares",
    },
    {
      fieldName: "enableFlickerEffect",
      type: "boolean",
      required: false,
      label: "Enable Flickering Light Effect",
    },
    {
      fieldName: "backgroundColor",
      type: "color",
      required: false,
      label: "Game Background Color",
    },
    {
      fieldName: "hudTextColor",
      type: "color",
      required: false,
      label: "HUD Text Color",
    },
    {
      fieldName: "wallColor",
      type: "color",
      required: false,
      label: "Wall Color",
    },
    {
      fieldName: "floorColor",
      type: "color",
      required: false,
      label: "Floor Color",
    },
    {
      fieldName: "startButtonLabel",
      type: "string",
      required: false,
      label: "Start Button Label",
      maxLength: 30,
    },
    {
      fieldName: "winMessage",
      type: "string",
      required: false,
      label: "Win Message",
      maxLength: 100,
    },
    {
      fieldName: "loseMessage",
      type: "string",
      required: false,
      label: "Lose Message (caught by ghost)",
      maxLength: 100,
    },
  ],
};
