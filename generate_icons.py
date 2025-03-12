from PIL import Image, ImageDraw

def create_icon(size, stroke_ratio=0.08):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Use a Playwright-inspired purple (#5C2D91)
    color = (92, 45, 145, 255)
    stroke = max(1, int(size * stroke_ratio))
    
    # Circle parameters (20% margin)
    margin = size * 0.2
    draw.ellipse([margin, margin, size - margin, size - margin], outline=color, width=stroke)
    
    # Crosshair lines: horizontal & vertical through center
    center = size // 2
    draw.line([(margin, center), (size - margin, center)], fill=color, width=stroke)
    draw.line([(center, margin), (center, size - margin)], fill=color, width=stroke)
    
    return img

sizes = [16, 48, 128]
icons = {}
for size in sizes:
    icon = create_icon(size)
    icon.save(f"icon{size}.png")
    icons[size] = icon

# Display the generated icons inline (if in a Jupyter environment)
from IPython.display import display
for size in sizes:
    print(f"Icon {size}x{size}:")
    display(icons[size])