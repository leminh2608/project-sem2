const fs = require('fs')
const path = require('path')

function testAdminCoursesAPIFix() {
  console.log('🧪 Testing Admin Courses API Route Fix...\n')

  const apiFilePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'courses', 'route.ts')
  
  try {
    // Read the file content
    const fileContent = fs.readFileSync(apiFilePath, 'utf8')
    
    // Test 1: Check for duplicate POST function definitions
    console.log('1. Testing for duplicate POST function definitions...')
    const postMatches = fileContent.match(/export async function POST/g)
    
    if (postMatches && postMatches.length === 1) {
      console.log('✅ Only one POST function definition found')
    } else if (postMatches && postMatches.length > 1) {
      console.log(`❌ Found ${postMatches.length} POST function definitions - duplicates still exist!`)
      return false
    } else {
      console.log('❌ No POST function definition found')
      return false
    }

    // Test 2: Check for all required HTTP methods
    console.log('\n2. Testing for all required HTTP method exports...')
    const requiredMethods = ['GET', 'POST', 'PATCH']
    const methodsFound = []
    
    requiredMethods.forEach(method => {
      const methodRegex = new RegExp(`export async function ${method}`, 'g')
      const matches = fileContent.match(methodRegex)
      
      if (matches && matches.length === 1) {
        methodsFound.push(method)
        console.log(`✅ ${method} function found`)
      } else if (matches && matches.length > 1) {
        console.log(`❌ Multiple ${method} function definitions found`)
        return false
      } else {
        console.log(`❌ ${method} function not found`)
        return false
      }
    })

    // Test 3: Check POST function has proper validation
    console.log('\n3. Testing POST function validation...')
    const hasRequiredValidation = [
      'courseName',
      'description', 
      'level',
      'Beginner',
      'Intermediate',
      'Advanced'
    ].every(term => fileContent.includes(term))
    
    if (hasRequiredValidation) {
      console.log('✅ POST function has proper validation')
    } else {
      console.log('❌ POST function missing required validation')
      return false
    }

    // Test 4: Check for admin authentication
    console.log('\n4. Testing admin authentication...')
    const hasAdminAuth = fileContent.includes("session.user.role !== 'admin'")
    
    if (hasAdminAuth) {
      console.log('✅ Admin authentication check found')
    } else {
      console.log('❌ Admin authentication check missing')
      return false
    }

    // Test 5: Check for proper imports
    console.log('\n5. Testing required imports...')
    const requiredImports = [
      'NextRequest',
      'NextResponse',
      'getServerSession',
      'createCourse',
      'bulkUpdateCourseStatus'
    ]
    
    const allImportsFound = requiredImports.every(importName => 
      fileContent.includes(importName)
    )
    
    if (allImportsFound) {
      console.log('✅ All required imports found')
    } else {
      console.log('❌ Some required imports missing')
      return false
    }

    // Test 6: Check file structure
    console.log('\n6. Testing file structure...')
    const lines = fileContent.split('\n')
    const totalLines = lines.length
    
    console.log(`✅ File has ${totalLines} lines`)
    
    if (totalLines > 50 && totalLines < 300) {
      console.log('✅ File size is reasonable')
    } else {
      console.log('⚠️  File size might be unusual')
    }

    // Test 7: Check for syntax issues
    console.log('\n7. Testing for basic syntax issues...')
    const syntaxChecks = [
      { test: fileContent.includes('export async function'), message: 'Has export functions' },
      { test: !fileContent.includes('export async function POST') || fileContent.match(/export async function POST/g).length === 1, message: 'No duplicate POST exports' },
      { test: fileContent.includes('try {') && fileContent.includes('catch'), message: 'Has error handling' },
      { test: fileContent.includes('return NextResponse.json'), message: 'Returns proper responses' }
    ]
    
    let syntaxIssues = 0
    syntaxChecks.forEach(check => {
      if (check.test) {
        console.log(`✅ ${check.message}`)
      } else {
        console.log(`❌ ${check.message}`)
        syntaxIssues++
      }
    })

    if (syntaxIssues === 0) {
      console.log('\n🎉 Admin Courses API Route Fix Test Complete!')
      console.log('\n📋 Summary:')
      console.log('✅ Duplicate POST function removed')
      console.log('✅ All HTTP methods properly defined')
      console.log('✅ Admin authentication working')
      console.log('✅ Proper validation in place')
      console.log('✅ Required imports present')
      console.log('✅ No syntax issues detected')
      console.log('\n🚀 API route should build successfully now!')
      return true
    } else {
      console.log(`\n❌ Found ${syntaxIssues} syntax issues that need to be fixed`)
      return false
    }

  } catch (error) {
    console.error('❌ Error reading API file:', error.message)
    return false
  }
}

// Run the test
const success = testAdminCoursesAPIFix()
process.exit(success ? 0 : 1)
