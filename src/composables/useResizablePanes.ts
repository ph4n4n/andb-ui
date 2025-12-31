import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface ResizablePanesOptions {
  minWidth?: number
  maxWidth?: number
  defaultLeftWidth?: number
  snapPoints?: number[]
  snapThreshold?: number
}

export function useResizablePanes(options: ResizablePanesOptions = {}) {
  const {
    minWidth = 200,
    maxWidth = 800,
    defaultLeftWidth = 50, // percentage
    snapPoints = [25, 50, 75],
    snapThreshold = 5
  } = options

  const containerRef = ref<HTMLElement | null>(null)
  const leftPaneWidth = ref(defaultLeftWidth)
  const isResizing = ref(false)

  const leftPaneStyle = computed(() => ({
    width: `${leftPaneWidth.value}%`
  }))

  const rightPaneStyle = computed(() => ({
    width: `${100 - leftPaneWidth.value}%`
  }))

  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault()
    isResizing.value = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizing.value || !containerRef.value) return

    const containerRect = containerRef.value.getBoundingClientRect()
    const containerWidth = containerRect.width
    const mouseX = event.clientX - containerRect.left

    // Calculate new width as percentage
    let newWidthPercent = (mouseX / containerWidth) * 100

    // Apply min/max constraints in pixels
    const minWidthPercent = (minWidth / containerWidth) * 100
    const maxWidthPercent = (maxWidth / containerWidth) * 100

    newWidthPercent = Math.max(minWidthPercent, Math.min(maxWidthPercent, newWidthPercent))

    // Snap to points
    for (const snapPoint of snapPoints) {
      if (Math.abs(newWidthPercent - snapPoint) < snapThreshold) {
        newWidthPercent = snapPoint
        break
      }
    }

    leftPaneWidth.value = newWidthPercent
  }

  const handleMouseUp = () => {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const adjustPaneWidth = (direction: 'left' | 'right') => {
    const step = 10
    if (direction === 'left') {
      leftPaneWidth.value = Math.max(25, leftPaneWidth.value - step)
    } else {
      leftPaneWidth.value = Math.min(75, leftPaneWidth.value + step)
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft') {
      event.preventDefault()
      adjustPaneWidth('left')
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight') {
      event.preventDefault()
      adjustPaneWidth('right')
    }
  }

  onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    containerRef,
    leftPaneWidth,
    isResizing,
    leftPaneStyle,
    rightPaneStyle,
    handleMouseDown,
    adjustPaneWidth
  }
}

