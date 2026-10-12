#r "System.Drawing.dll"

using System;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;

public class Startup
{
    // Entry point for edge.js
    public async Task<object> Invoke(string input)
    {
        return IconExtractor.GetIcon(input);
    }
}

static class IconExtractor
{
    public static string GetIcon(string filePath)
    {
        try
        {
            // Extract the associated icon from the file path
            Icon ico = Icon.ExtractAssociatedIcon(filePath);

            if (ico == null)
            {
                // Return JSON-compatible error message
                return "error: Icon extraction failed for unknow reason.";
            }

            // Convert icon to bitmap and then to Base64 string
            using (MemoryStream memoryStream = new MemoryStream())
            {
                ico.ToBitmap().Save(memoryStream, System.Drawing.Imaging.ImageFormat.Png);
                byte[] iconBytes = memoryStream.ToArray();

                // Return Base64 string in JSON-compatible format
                return Convert.ToBase64String(iconBytes);
            }
        }
        catch (Exception ex)
        {
            // Return detailed error message in JSON-compatible format
            return "error: " + ex.Message.Replace("\"", "\\\"");
        }
    }
}
