from PIL import Image, ImageDraw, ImageFilter
import math
import os

def generate_pwa_icon(size, filename):
    # Create high-res RGBA image
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background color: #0F1B1E
    bg_color = (15, 27, 30, 255)
    
    # Draw rounded rectangle background
    corner_radius = int(size * 0.2)
    draw.rounded_rectangle([(0, 0), (size, size)], radius=corner_radius, fill=bg_color)
    
    # Center coordinates
    center = size / 2.0
    
    # Constellation node parameters
    cyan = (79, 209, 197, 255)       # #4FD1C5
    cyan_dim = (79, 209, 197, 120)
    line_color = (79, 209, 197, 180)
    
    # Node locations relative to center (dx, dy, radius)
    r_center = size * 0.05
    r_outer = size * 0.035
    r_small = size * 0.025
    
    dist_main = size * 0.28
    dist_sub = size * 0.24
    
    nodes = [
        (0, 0, r_center), # Center
        (0, -dist_main, r_outer), # Top
        (0, dist_main, r_outer), # Bottom
        (-dist_main, 0, r_outer), # Left
        (dist_main, 0, r_outer), # Right
        (-dist_sub * 0.7, -dist_sub * 0.7, r_small), # Top-Left
        (dist_sub * 0.7, -dist_sub * 0.7, r_small), # Top-Right
        (-dist_sub * 0.7, dist_sub * 0.7, r_small), # Bottom-Left
        (dist_sub * 0.7, dist_sub * 0.7, r_small), # Bottom-Right
    ]
    
    # Draw connecting lines first
    line_width = max(2, int(size * 0.015))
    
    # Connect center to top, bottom, left, right
    main_connections = [1, 2, 3, 4]
    for idx in main_connections:
        nx, ny, _ = nodes[idx]
        draw.line([(center, center), (center + nx, center + ny)], fill=line_color, width=line_width)
        
    # Outer cross connections
    sub_connections = [
        (1, 5), (1, 6),
        (2, 7), (2, 8),
        (3, 5), (3, 7),
        (4, 6), (4, 8)
    ]
    sub_line_width = max(1, int(size * 0.008))
    sub_line_color = (79, 209, 197, 100)
    for i1, i2 in sub_connections:
        x1, y1, _ = nodes[i1]
        x2, y2, _ = nodes[i2]
        draw.line([(center + x1, center + y1), (center + x2, center + y2)], fill=sub_line_color, width=sub_line_width)
    
    # Create glow layer for nodes
    glow_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    
    for dx, dy, nr in nodes:
        cx, cy = center + dx, center + dy
        glow_r = nr * 2.2
        glow_draw.ellipse([(cx - glow_r, cy - glow_r), (cx + glow_r, cy + glow_r)], fill=(79, 209, 197, 80))
        
    glow_blur = glow_img.filter(ImageFilter.GaussianBlur(radius=size * 0.02))
    img = Image.alpha_composite(img, glow_blur)
    draw = ImageDraw.Draw(img)
    
    # Draw nodes
    for dx, dy, nr in nodes:
        cx, cy = center + dx, center + dy
        draw.ellipse([(cx - nr, cy - nr), (cx + nr, cy + nr)], fill=cyan)
        
    # Save image
    img.save(filename, "PNG")
    print(f"Generated {filename} ({size}x{size})")

os.makedirs("public", exist_ok=True)
generate_pwa_icon(192, "public/icon-192.png")
generate_pwa_icon(512, "public/icon-512.png")
generate_pwa_icon(180, "public/apple-touch-icon.png")
