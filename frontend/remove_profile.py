from pathlib import Path

p = Path("src/CropDetection.jsx")
s = p.read_text(encoding="utf-8")

# Remove profile button
a = s.index('        <div className="detection-header-actions">')
b = s.index('        <span className="detection-kicker">', a)
s = s[:a] + s[b:]

# Remove profile popup
a = s.index('        {profileOpen && (')
b = s.index('      </div>\n\n      {/* Upload Section */}', a)
s = s[:a] + '      </div>\n\n      {/* Upload Section */}' + s[b + len('      </div>\n\n      {/* Upload Section */}'):]

p.write_text(s, encoding="utf-8")
print("DONE - profile sections removed safely")
