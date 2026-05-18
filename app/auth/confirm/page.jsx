const confirmEmail = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      setStatus('error')
      showToast({
        type: 'error',
        message: 'Invalid or expired confirmation link.',
      })
      return
    }

    const user = data.session.user

    // 🔥 Check if user has resorts
    const { data: resorts, error: resortError } = await supabase
      .from('resorts')
      .select('id')
      .eq('user_id', user.id)

    if (resortError) {
      console.error(resortError)
      setStatus('error')
      return
    }

    // Load app context
    await refreshAppData()

    setStatus('success')

    showToast({
      type: 'success',
      message: 'Email confirmed successfully!',
    })

    // 🎯 Redirect logic
    setTimeout(() => {
      if (!resorts || resorts.length === 0) {
        router.replace('/onboarding')
      } else {
        router.replace('/dashboard')
      }
    }, 1200)
  } catch (err) {
    console.error(err)
    setStatus('error')
  }
}