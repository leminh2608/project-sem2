const fs = require('fs')
const path = require('path')

function verifyAdminAPIFinal() {
  console.log('🔍 Final Verification of Admin Courses API Route...\n')

  const apiFilePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'courses', 'route.ts')
  
  try {
    // Read the file content
    const fileContent = fs.readFileSync(apiFilePath, 'utf8')
    const lines = fileContent.split('\n')
    
    console.log(`📄 File: ${apiFilePath}`)
    console.log(`📏 Total lines: ${lines.length}`)
    console.log('')

    // Test 1: Count all export function definitions
    console.log('1. Counting all export function definitions...')
    const exportFunctions = fileContent.match(/export async function \w+/g) || []
    console.log(`   Found ${exportFunctions.length} export functions:`)
    exportFunctions.forEach((func, index) => {
      console.log(`   ${index + 1}. ${func}`)
    })

    // Test 2: Specifically check for POST functions
    console.log('\n2. Checking for POST function definitions...')
    const postFunctions = fileContent.match(/export async function POST/g) || []
    console.log(`   Found ${postFunctions.length} POST function(s)`)
    
    if (postFunctions.length === 1) {
      console.log('   ✅ Exactly one POST function - CORRECT')
    } else if (postFunctions.length === 0) {
      console.log('   ❌ No POST function found - ERROR')
      return false
    } else {
      console.log(`   ❌ Multiple POST functions found (${postFunctions.length}) - ERROR`)
      return false
    }

    // Test 3: Check for required HTTP methods
    console.log('\n3. Verifying all required HTTP methods...')
    const requiredMethods = ['GET', 'POST', 'PATCH']
    let allMethodsFound = true
    
    requiredMethods.forEach(method => {
      const methodRegex = new RegExp(`export async function ${method}`, 'g')
      const matches = fileContent.match(methodRegex) || []
      
      if (matches.length === 1) {
        console.log(`   ✅ ${method}: Found exactly 1`)
      } else if (matches.length === 0) {
        console.log(`   ❌ ${method}: Not found`)
        allMethodsFound = false
      } else {
        console.log(`   ❌ ${method}: Found ${matches.length} (duplicate)`)
        allMethodsFound = false
      }
    })

    // Test 4: Check POST function content
    console.log('\n4. Verifying POST function content...')
    const postFunctionMatch = fileContent.match(/export async function POST[\s\S]*?(?=export async function|\n$)/g)
    
    if (postFunctionMatch && postFunctionMatch.length === 1) {
      const postFunction = postFunctionMatch[0]
      
      const checks = [
        { test: postFunction.includes('session.user.role !== \'admin\''), name: 'Admin authentication' },
        { test: postFunction.includes('courseName') && postFunction.includes('description') && postFunction.includes('level'), name: 'Required fields validation' },
        { test: postFunction.includes('Beginner') && postFunction.includes('Intermediate') && postFunction.includes('Advanced'), name: 'Level validation' },
        { test: postFunction.includes('createCourse'), name: 'createCourse function call' },
        { test: postFunction.includes('try {') && postFunction.includes('catch'), name: 'Error handling' },
        { test: postFunction.includes('NextResponse.json'), name: 'Proper response format' }
      ]
      
      checks.forEach(check => {
        if (check.test) {
          console.log(`   ✅ ${check.name}`)
        } else {
          console.log(`   ❌ ${check.name}`)
          allMethodsFound = false
        }
      })
    } else {
      console.log('   ❌ Could not extract POST function content')
      allMethodsFound = false
    }

    // Test 5: Check for proper imports
    console.log('\n5. Verifying imports...')
    const requiredImports = [
      'NextRequest',
      'NextResponse',
      'getServerSession',
      'authOptions',
      'createCourse',
      'bulkUpdateCourseStatus'
    ]
    
    requiredImports.forEach(importName => {
      if (fileContent.includes(importName)) {
        console.log(`   ✅ ${importName}`)
      } else {
        console.log(`   ❌ ${importName}`)
        allMethodsFound = false
      }
    })

    // Test 6: File structure validation
    console.log('\n6. File structure validation...')
    
    // Check that functions are properly closed
    const openBraces = (fileContent.match(/{/g) || []).length
    const closeBraces = (fileContent.match(/}/g) || []).length
    
    if (openBraces === closeBraces) {
      console.log(`   ✅ Balanced braces (${openBraces} open, ${closeBraces} close)`)
    } else {
      console.log(`   ❌ Unbalanced braces (${openBraces} open, ${closeBraces} close)`)
      allMethodsFound = false
    }

    // Check for proper function endings
    const functionEndings = fileContent.match(/}\s*export async function/g) || []
    if (functionEndings.length === exportFunctions.length - 1) {
      console.log('   ✅ Functions properly separated')
    } else {
      console.log('   ⚠️  Function separation might have issues')
    }

    // Final result
    console.log('\n' + '='.repeat(50))
    if (allMethodsFound && postFunctions.length === 1) {
      console.log('🎉 VERIFICATION SUCCESSFUL!')
      console.log('')
      console.log('✅ No duplicate POST functions')
      console.log('✅ All required HTTP methods present')
      console.log('✅ POST function has proper validation')
      console.log('✅ Admin authentication implemented')
      console.log('✅ All required imports present')
      console.log('✅ File structure is valid')
      console.log('')
      console.log('🚀 The API route should build successfully!')
      return true
    } else {
      console.log('❌ VERIFICATION FAILED!')
      console.log('')
      console.log('Issues found that need to be fixed before building.')
      return false
    }

  } catch (error) {
    console.error('❌ Error reading API file:', error.message)
    return false
  }
}

// Run the verification
const success = verifyAdminAPIFinal()
process.exit(success ? 0 : 1)
